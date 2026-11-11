import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';

// โครงเดียวกับหน้า Login ต่างกันแค่ช่องกรอกและฟังก์ชันที่เรียก (เหมือน MovieHub)
// สมัครใหม่ได้บทบาท member เสมอ (Go ไม่รับ role จากฟอร์ม)
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-3xl font-medium text-ink">สมัครสมาชิก</h1>
      <p className="mt-2 text-sm text-ink-soft">สมาชิกเขียนรีวิว ให้คะแนน และเก็บรายการหนังสือที่อยากอ่านได้</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="reg-name" className={labelClass}>ชื่อที่แสดงในรีวิว</label>
          <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50}
                 autoComplete="nickname" className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-email" className={labelClass}>อีเมล</label>
          <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                 autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-password" className={labelClass}>รหัสผ่าน</label>
          <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
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
  );
}

export default Register;
