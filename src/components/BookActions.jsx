import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/backend';

// ปุ่ม wishlist ในหน้ารายละเอียด  bookRef = เลขในระบบหรือรหัส Open Library
// Guest กดแล้วพาไปหน้า Login พร้อมข้อความ และกลับมาหน้านี้หลัง login
function BookActions({ bookRef, category, onChange }) {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [inWishlist, setInWishlist] = useState(false);
  const [status, setStatus] = useState(isLoggedIn ? 'loading' : 'idle');   // 'loading' | 'idle' | 'saving'
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      setInWishlist(false);
      setStatus('idle');
      return;
    }
    let ignore = false;
    setStatus('loading');
    getWishlist(token)
      .then(items => {
        if (!ignore) setInWishlist(items.some(b => String(b.id) === String(bookRef) || b.openlibraryKey === bookRef));
      })
      .catch(err => { if (!ignore) setMessage(err.message); })
      .finally(() => { if (!ignore) setStatus('idle'); });
    return () => { ignore = true; };
  }, [bookRef, token]);

  async function handleClick() {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname, reason: 'wishlist' } });
      return;
    }
    setStatus('saving');
    setMessage(null);
    try {
      if (inWishlist) {
        await removeFromWishlist(bookRef, token);
        setInWishlist(false);
        setMessage('นำออกจากรายการอยากอ่านแล้ว');
      } else {
        await addToWishlist(bookRef, token, category);
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการอยากอ่านแล้ว');
      }
      onChange?.();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setStatus('idle');
    }
  }

  const busy = status !== 'idle';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={handleClick} disabled={busy} aria-pressed={isLoggedIn ? inWishlist : undefined}
              className={'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-60 ' +
                (inWishlist ? 'border-cloth bg-cloth-light text-cloth-dark' : 'border-line bg-white text-ink hover:border-cloth hover:text-cloth')}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"
                d="M5 2.5h10a.5.5 0 0 1 .5.5v14.2l-5.5-3.6-5.5 3.6V3a.5.5 0 0 1 .5-.5z" />
        </svg>
        {status === 'loading' ? 'กำลังตรวจรายการ...' : inWishlist ? 'อยู่ในรายการอยากอ่าน' : 'เพิ่มเข้ารายการอยากอ่าน'}
      </button>
      {message && <span className="text-sm text-ink-soft" role="status">{message}</span>}
    </div>
  );
}

export default BookActions;
