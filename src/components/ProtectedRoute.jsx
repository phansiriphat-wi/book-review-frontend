import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ครอบหน้าที่ต้อง login: ถ้ายังไม่ได้ login ส่งไปหน้า /login แล้วจำไว้ว่ามาจากไหน (เหมือน MovieHub)
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }
  return children;
}

export default ProtectedRoute;
