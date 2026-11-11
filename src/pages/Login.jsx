import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';

const REASONS = {
  review: 'เข้าสู่ระบบก่อนเขียนรีวิวหรือให้คะแนน',
  wishlist: 'เข้าสู่ระบบก่อนเพิ่มหนังสือเข้ารายการอยากอ่าน',
  'login-required': 'หน้านี้สำหรับสมาชิก กรุณาเข้าสู่ระบบ',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const { login, expired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';                   // ProtectedRoute / ปุ่มรีวิว ส่งมาบอกว่าเดิมจะไปไหน
  const reason = expired ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' : REASONS[location.state?.reason];

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await login(email, password);                          // POST /api/auth/login + จำ token
      navigate(from, { replace: true });                     // กลับไปหน้าที่ตั้งใจจะไปตอนแรก
    } catch (err) {
      setError(err.message);                                 // ข้อความ 401 จาก server
      setStatus('typing');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-ink">เข้าสู่ระบบ</h1>
      {reason && <p className="mt-3 rounded-md bg-gilt-light px-3 py-2 text-sm text-ink" role="status">{reason}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className={labelClass}>อีเมล</label>
          <input id="login-email" type="email" autoComplete="email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="login-password" className={labelClass}>รหัสผ่าน</label>
          <input id="login-password" type="password" autoComplete="current-password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
        </div>
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>

      <p className="mt-8 text-sm text-ink-soft">
        ยังไม่มีบัญชี? <Link to="/register" state={location.state} className="text-cloth hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
