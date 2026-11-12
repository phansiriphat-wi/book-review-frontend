import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';
import AuthStage from '../components/mascot/AuthStage';
import PasswordInput from '../components/PasswordInput';


function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState(null);                  // ช่องที่กำลังพิมพ์ ให้น้องบุ๊คมองตาม
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await register(name.trim(), email.trim(), password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);                       // 409 อีเมลซ้ำ หรือ 400 กรอกไม่ครบ ข้อความมาจาก server
      setStatus('typing');
    }
  }

  // ท่าทางของน้องบุ๊คตามสิ่งที่ผู้ใช้ทำอยู่
  const lookAtField = (text) => ({ x: 0.2 + Math.min(text.length, 28) / 28 * 0.8, y: 0.5 });
  const shortName = name.trim().slice(0, 20);
  let buddy = { mood: 'happy', followPointer: true, waving: true, bubble: 'มาเป็นเพื่อนนักอ่านกันนะ!' };
  if (status === 'submitting') buddy = { mood: 'wow', look: { x: 0, y: -0.8 }, bubble: 'กำลังทำบัตรสมาชิกให้...' };
  else if (error) buddy = { mood: 'oops', look: { x: 0.6, y: 0.4 }, coverEyes: focus === 'password', peekThrough: showPassword,
                            bubble: 'อุ๊ย มีอะไรไม่ถูกนิดหน่อย ดูข้อความใต้ปุ่มนะ' };
  else if (focus === 'password') buddy = {
    mood: 'smile', coverEyes: true, peekThrough: showPassword,
    bubble: password.length >= 8 ? 'รหัสยาวพอแล้ว เยี่ยมเลย!' : showPassword ? 'แอบดูนิดเดียวนะ' : 'ไม่แอบดูแน่นอน! อย่างน้อย 8 ตัวนะ',
  };
  else if (focus === 'name') buddy = { mood: 'happy', look: lookAtField(name), bubble: shortName ? `ยินดีที่ได้รู้จัก ${shortName}!` : 'อยากให้เรียกว่าอะไรดี?' };
  else if (focus === 'email') buddy = { mood: 'smile', look: lookAtField(email), bubble: 'อีเมลนี้ใช้ตอนเข้าสู่ระบบนะ' };

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-14 md:py-16">
      <AuthStage {...buddy} />

      <div className="w-full max-w-sm justify-self-center">
        <h1 className="font-serif text-3xl font-medium text-ink">สมัครสมาชิก</h1>
        <p className="mt-2 text-sm text-ink-soft">สมาชิกเขียนรีวิว ให้คะแนน และเก็บรายการหนังสือที่อยากอ่านได้</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reg-name" className={labelClass}>ชื่อที่แสดงในรีวิว</label>
            <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50}
                   autoComplete="nickname" className={inputClass}
                   onFocus={() => setFocus('name')} onBlur={() => setFocus(null)} />
          </div>
          <div>
            <label htmlFor="reg-email" className={labelClass}>อีเมล</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                   autoComplete="email" className={inputClass}
                   onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
          </div>
          <div>
            <label htmlFor="reg-password" className={labelClass}>รหัสผ่าน</label>
            <PasswordInput id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)}
                           required minLength={8} maxLength={72} autoComplete="new-password"
                           show={showPassword} onToggle={() => setShowPassword(s => !s)}
                           onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} />
            <p className="mt-1 text-xs text-ink-faint">อย่างน้อย 8 ตัวอักษร</p>
          </div>
          <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
            {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </form>
        <p className="mt-8 text-sm text-ink-soft">
          มีบัญชีแล้ว? <Link to="/login" state={location.state} className="text-cloth hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
