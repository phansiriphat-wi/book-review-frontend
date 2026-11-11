import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { useAuth } from '../auth/AuthContext';
import { getWishlist, removeFromWishlist } from '../api/backend';

// หน้า "รายการอยากอ่าน" (เส้นทาง /me/wishlist ครอบด้วย ProtectedRoute แล้ว)
function Wishlist() {
  const { token, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [removing, setRemoving] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const items = await getWishlist(token);
        if (!ignore) { setBooks(items); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function handleRemove(book) {
    setRemoving(book.id);
    setMessage(null);
    try {
      await removeFromWishlist(book.id, token);
      setBooks(list => list.filter(b => b.id !== book.id));
      setMessage(`นำ ${book.title} ออกจากรายการแล้ว`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-serif text-3xl font-medium text-ink">รายการอยากอ่าน</h1>
      <p className="mt-1 text-sm text-ink-soft">
        ของ {user?.name}{status === 'success' && ` ${books.length} เล่ม`}
      </p>
      {message && <p className="mt-4 rounded-md border border-cloth/30 bg-cloth-light px-4 py-3 text-sm text-cloth-dark" role="status">{message}</p>}
      <div className="mt-8">
        <BookGrid books={books} status={status} error={error} onRetry={() => setReloadKey(k => k + 1)}
                  empty={<>ยังไม่มีหนังสือในรายการ <Link to="/books" className="text-cloth underline">เลือกหนังสือ</Link> แล้วกดเพิ่มเข้ารายการอยากอ่าน</>}
                  renderAction={(b) => (
                    <button onClick={() => handleRemove(b)} disabled={removing === b.id}
                            className="text-sm text-ink-soft hover:text-red-700 disabled:opacity-50">
                      {removing === b.id ? 'กำลังนำออก...' : 'นำออกจากรายการ'}
                    </button>
                  )} />
      </div>
    </div>
  );
}

export default Wishlist;
