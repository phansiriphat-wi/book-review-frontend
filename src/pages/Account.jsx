import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMe } from '../api/backend';
import { ErrorBox, Loading, btnGhost, dateTH } from '../components/admin/AdminStates';

// หน้าข้อมูลบัญชี (/me ครอบด้วย ProtectedRoute)  ข้อมูลมาจาก GET /api/auth/me ไม่ใช่ localStorage
function Account() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getMe(token)
      .then(u => { if (!ignore) { setMe(u); setStatus('success'); } })
      .catch(err => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-serif text-3xl font-medium text-ink">บัญชีของฉัน</h1>
      <div className="mt-8">
        {status === 'loading' && <Loading />}
        {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
        {status === 'success' && (
          <>
            <dl className="divide-y divide-line border-y border-line">
              {[
                ['ชื่อ', me.name],
                ['อีเมล', me.email],
                ['บทบาท', me.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'],
                ['สมัครเมื่อ', me.createdAt ? dateTH(me.createdAt) : '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/me/wishlist" className={btnGhost}>รายการอยากอ่าน</Link>
              {me.role === 'admin' && <Link to="/admin" className={btnGhost}>หลังบ้าน</Link>}
              <button onClick={() => { logout(); navigate('/'); }} className={btnGhost}>ออกจากระบบ</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Account;
