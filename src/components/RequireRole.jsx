import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ครอบหน้าที่ต้องมีบทบาทเฉพาะ (เช่นหลังบ้าน) Go ตรวจซ้ำทุกคำขอด้วย RequireRole ฝั่ง server
function RequireRole({ role, children }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }
  if (user?.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="font-serif text-5xl font-medium text-line">403</p>
        <h1 className="mt-3 text-lg font-medium text-ink">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</h1>
        <p className="mt-1 text-sm text-ink-soft">บัญชีของคุณเป็น {user?.role ?? 'member'}</p>
        <Link to="/" className="mt-5 inline-block text-sm text-cloth hover:underline">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default RequireRole;
