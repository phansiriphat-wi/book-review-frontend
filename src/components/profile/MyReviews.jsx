import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReviews } from '../../api/backend';
import { ErrorBox, dateTH } from '../admin/AdminStates';
import { StarDisplay } from '../StarRating';
import BookCover from '../BookCover';
import Pagination from '../Pagination';
import BookBuddy from '../mascot/BookBuddy';

export const MY_REVIEWS_PAGE_SIZE = 5;

// รีวิวของฉัน: GET /api/me/reviews (Go ใช้เลขผู้ใช้จากตั๋ว เห็นเฉพาะรีวิวของตัวเอง)
// onSummary({ total, avgRating }) ส่งตัวเลขให้การ์ดสถิติด้านบน
function MyReviews({ token, onSummary = () => {} }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getMyReviews({ page, pageSize: MY_REVIEWS_PAGE_SIZE }, token)
      .then(d => {
        if (ignore) return;
        setData(d);
        setStatus('success');
        onSummary({ total: d.total, avgRating: d.avgRating });
      })
      .catch(err => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, page, reloadKey, onSummary]);

  if (status === 'loading' && !data) {
    return (
      <ul className="space-y-4" aria-busy="true" aria-label="กำลังโหลดรีวิวของฉัน">
        {[0, 1, 2].map(i => (
          <li key={i} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
            <div className="shimmer h-24 w-16 shrink-0 rounded-[3px]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="shimmer h-4 w-1/2 rounded" />
              <div className="shimmer h-3 w-24 rounded" />
              <div className="shimmer h-3 w-full rounded" />
            </div>
          </li>
        ))}
      </ul>
    );
  }
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-latte-deep/60 bg-cloth-light/50 px-6 py-10 text-center">
        <BookBuddy mood="smile" look={{ x: 0, y: 0.4 }} className="w-20" />
        <p className="font-medium text-ink">ยังไม่มีรีวิวเลย</p>
        <p className="text-sm text-ink-soft">อ่านเล่มไหนแล้วชอบหรือไม่ชอบ เล่าให้เพื่อนนักอ่านฟังได้</p>
        <Link to="/books" className="mt-1 text-sm font-medium text-cloth hover:underline">ไปเลือกหนังสือเล่มแรก</Link>
      </div>
    );
  }

  return (
    <div className={status === 'loading' ? 'opacity-60 transition-opacity' : ''} aria-busy={status === 'loading'}>
      <ul className="space-y-4">
        {data.items.map(r => (
          <li key={r.id} className="flex gap-4 rounded-2xl border border-line bg-white p-4 shadow-[0_6px_16px_-12px_rgb(var(--shadow)/.5)]">
            <Link to={`/books/${r.book.id}`} className="w-16 shrink-0 sm:w-20" tabIndex={-1} aria-hidden="true">
              <BookCover src={r.book.coverUrl} title={r.book.title} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/books/${r.book.id}`} className="font-serif text-lg font-medium leading-snug text-ink hover:text-cloth">
                {r.book.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarDisplay value={r.rating} />
                <span className="text-xs text-ink-faint">
                  {dateTH(r.createdAt)}{r.updatedAt !== r.createdAt && ' (แก้ไขแล้ว)'}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{r.comment}</p>
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} total={data.total} pageSize={MY_REVIEWS_PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

export default MyReviews;
