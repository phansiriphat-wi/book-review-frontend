import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';
import AuthStage from '../components/mascot/AuthStage';
import PasswordInput from '../components/PasswordInput';

const REASONS = {
  review: 'เข้าสู่ระบบก่อนเขียนรีวิวหรือให้คะแนน',
  wishlist: 'เข้าสู่ระบบก่อนเพิ่มหนังสือเข้ารายการอยากอ่าน',
  'login-required': 'หน้านี้สำหรับสมาชิก กรุณาเข้าสู่ระบบ',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState(null);                   // ช่องที่กำลังพิมพ์ ให้น้องบุ๊คมองตาม
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

  // ท่าทางของน้องบุ๊คตามสิ่งที่ผู้ใช้ทำอยู่
  let buddy = { mood: 'smile', followPointer: true, waving: true, bubble: 'สวัสดี! กลับมาอ่านต่อกันเถอะ' };
  if (status === 'submitting') buddy = { mood: 'wow', look: { x: 0, y: -0.8 }, bubble: 'กำลังเปิดประตูห้องสมุด...' };
  else if (error) buddy = { mood: 'oops', look: { x: 0.6, y: 0.4 }, coverEyes: focus === 'password', peekThrough: showPassword,
                            bubble: 'อุ๊ย ลองตรวจอีเมลกับรหัสผ่านอีกทีนะ' };
  else if (focus === 'password') buddy = showPassword
    ? { mood: 'smile', coverEyes: true, peekThrough: true, bubble: 'แอบดูนิดเดียวนะ' }
    : { mood: 'smile', coverEyes: true, bubble: 'ไม่แอบดูแน่นอน!' };
  else if (focus === 'email') buddy = { mood: 'smile', look: { x: 0.2 + Math.min(email.length, 28) / 28 * 0.8, y: 0.5 }, bubble: email ? 'อีเมลนี้ใช่ไหมนะ...' : 'ใส่อีเมลที่สมัครไว้ได้เลย' };

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-14 md:py-16">
      <AuthStage {...buddy} />

      <div className="w-full max-w-sm justify-self-center">
        <h1 className="font-serif text-3xl font-medium text-ink">เข้าสู่ระบบ</h1>
        {reason && <p className="mt-3 rounded-md bg-gilt-light px-3 py-2 text-sm text-ink" role="status">{reason}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className={labelClass}>อีเมล</label>
            <input id="login-email" type="email" autoComplete="email" value={email}
                   onChange={(e) => setEmail(e.target.value)} required className={inputClass}
                   onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
          </div>
          <div>
            <label htmlFor="login-password" className={labelClass}>รหัสผ่าน</label>
            <PasswordInput id="login-password" autoComplete="current-password" value={password}
                           onChange={(e) => setPassword(e.target.value)} required
                           show={showPassword} onToggle={() => setShowPassword(s => !s)}
                           onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} />
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
    </div>
  );
}

export default Login;
