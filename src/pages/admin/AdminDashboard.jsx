import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading, dateTH } from '../../components/admin/AdminStates';
import { StarDisplay } from '../../components/StarRating';
import BookCover from '../../components/BookCover';
import { categoryLabel, useCategories } from '../../data/categories';

function Stat({ label, value, to }) {
  const body = (
    <>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 font-serif text-3xl font-medium text-ink">{value}</dd>
    </>
  );
  return to
    ? <Link to={to} className="block rounded-lg border border-line bg-white p-4 hover:border-cloth">{body}</Link>
    : <div className="rounded-lg border border-line bg-white p-4">{body}</div>;
}

function AdminDashboard() {
  const { token } = useAuth();
  const categories = useCategories();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminStats(token);           // ยิงครั้งเดียว ได้ทุกตัวเลขของหน้านี้
        if (!ignore) { setStats(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  const maxCat = Math.max(1, ...stats.booksByCategory.map(c => c.books));
  return (
    <div className="space-y-10">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="หนังสือในระบบ" value={stats.books.toLocaleString('th-TH')} to="/admin/books" />
        <Stat label="สมาชิก" value={stats.users.toLocaleString('th-TH')} to="/admin/users" />
        <Stat label="รีวิว" value={stats.reviews.toLocaleString('th-TH')} to="/admin/reviews" />
        <Stat label="ในรายการอยากอ่าน" value={stats.wishlists.toLocaleString('th-TH')} />
        <Stat label="คะแนนเฉลี่ยทั้งเว็บ" value={stats.avgRating != null ? stats.avgRating.toFixed(2) : '-'} />
      </dl>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">คะแนนสูงสุด</h2>
          {stats.topRated.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">ยังไม่มีรีวิว</p>
          ) : (
            <ol className="mt-3 divide-y divide-line">
              {stats.topRated.map(b => (
                <li key={b.id} className="flex items-center gap-3 py-3">
                  <div className="w-10 shrink-0"><BookCover src={b.coverUrl} title={b.title} /></div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/books/${b.id}`} className="block truncate font-medium text-ink hover:text-cloth">{b.title}</Link>
                    <p className="truncate text-xs text-ink-soft">{b.author}</p>
                  </div>
                  <StarDisplay value={b.avgRating} count={b.reviewCount} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">หนังสือตามหมวด</h2>
          <ul className="mt-4 space-y-2">
            {stats.booksByCategory.map(c => (
              <li key={c.category} className="grid grid-cols-[8rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="truncate text-ink-soft">{categoryLabel(c.category, categories)}</span>
                <span className="h-2 rounded-full bg-paper-shade">
                  <span className="block h-2 rounded-full bg-cloth" style={{ width: `${(c.books / maxCat) * 100}%` }} />
                </span>
                <span className="text-right text-ink">{c.books}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">รีวิวล่าสุด</h2>
          {stats.latestReviews.length === 0 ? <p className="mt-3 text-sm text-ink-faint">ยังไม่มีรีวิว</p> : (
            <ul className="mt-3 divide-y divide-line">
              {stats.latestReviews.map(r => (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="font-medium text-ink">{r.user.name}</span>
                    <span className="text-ink-faint">รีวิว</span>
                    <Link to={`/books/${r.bookId}`} className="truncate text-cloth hover:underline">{r.book?.title}</Link>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/reviews" className="mt-2 inline-block text-sm text-cloth hover:underline">จัดการรีวิวทั้งหมด</Link>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">สมาชิกใหม่ล่าสุด</h2>
          <ul className="mt-3 divide-y divide-line">
            {stats.newestUsers.map(u => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{u.name}</p>
                  <p className="truncate text-xs text-ink-soft">{u.email}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-ink-faint">
                  {u.role === 'admin' && <span className="mr-2 rounded-full bg-cloth-light px-2 py-0.5 text-cloth-dark">admin</span>}
                  {dateTH(u.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
