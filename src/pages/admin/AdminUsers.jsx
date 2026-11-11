import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getAdminUsers } from '../../api/backend';
import { ErrorBox, Loading, inputClass, dateTH } from '../../components/admin/AdminStates';

// รายชื่อสมาชิก ดูอย่างเดียว (ตามโจทย์ ไม่มีการเปลี่ยนบทบาท)
function AdminUsers() {
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAdminUsers(token);
        if (!ignore) { setUsers(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  const q = query.trim().toLowerCase();
  const shown = users.filter(u => q === '' || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">สมาชิก</h2>
          {status === 'success' && (
            <p className="text-sm text-ink-soft">ทั้งหมด {users.length} คน ผู้ดูแลระบบ {users.filter(u => u.role === 'admin').length} คน</p>
          )}
        </div>
        <label htmlFor="admin-users-q" className="sr-only">ค้นชื่อหรืออีเมล</label>
        <input id="admin-users-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="ค้นชื่อหรืออีเมล" className={inputClass + ' md:w-64'} />
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-paper-shade text-left text-xs text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">สมาชิก</th>
                <th scope="col" className="px-4 py-3 font-medium">บทบาท</th>
                <th scope="col" className="px-4 py-3 font-medium">สมัครเมื่อ</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">รีวิว</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">อยากอ่าน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map(u => (
                <tr key={u.id} className="hover:bg-paper-shade/60">
                  <td className="px-4 py-2">
                    <p className="font-medium text-ink">{u.name} {u.id === me?.id && <span className="text-xs font-normal text-ink-faint">(คุณ)</span>}</p>
                    <p className="text-xs text-ink-soft">{u.email}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className={'rounded-full px-2 py-0.5 text-xs ' + (u.role === 'admin' ? 'bg-cloth-light text-cloth-dark' : 'bg-paper-shade text-ink-soft')}>
                      {u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-ink-soft">{u.createdAt ? dateTH(u.createdAt) : '-'}</td>
                  <td className="px-4 py-2 text-right text-ink">{u.reviewCount ?? 0}</td>
                  <td className="px-4 py-2 text-right text-ink">{u.wishlistCount ?? 0}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-faint">ไม่พบสมาชิกที่ค้นหา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
