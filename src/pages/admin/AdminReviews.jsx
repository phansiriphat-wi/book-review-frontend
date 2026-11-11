import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { deleteReview, getAdminReviews } from '../../api/backend';
import { ErrorBox, Loading, Notice, ConfirmBox, inputClass, dateTH } from '../../components/admin/AdminStates';
import Pagination from '../../components/Pagination';
import { StarDisplay } from '../../components/StarRating';

const PAGE_SIZE = 20;

// รีวิวทั้งหมดใหม่สุดก่อน ค้นจากข้อความ ชื่อหนังสือ หรือชื่อผู้รีวิว แล้วลบรีวิวที่ไม่เหมาะสม
function AdminReviews() {
  const { token } = useAuth();
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const result = await getAdminReviews({ q, page, pageSize: PAGE_SIZE }, token);
        if (!ignore) { setData(result); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [q, page, token, reloadKey]);

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteReview(target.id, token);
      setNotice({ tone: 'success', text: `ลบรีวิวของ ${target.user.name} แล้ว` });
      setReloadKey(k => k + 1);
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    } finally {
      setBusy(false);
      setTarget(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">รีวิวทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-ink-soft">{data.total.toLocaleString('th-TH')} รีวิว</p>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setQ(draft.trim()); setPage(1); }} role="search">
          <label htmlFor="admin-reviews-q" className="sr-only">ค้นรีวิว</label>
          <input id="admin-reviews-q" type="search" value={draft} onChange={(e) => setDraft(e.target.value)}
                 placeholder="ค้นข้อความ ชื่อหนังสือ หรือผู้รีวิว" className={inputClass + ' md:w-80'} />
        </form>
      </div>

      {notice && <div className="mb-4"><Notice tone={notice.tone}>{notice.text}</Notice></div>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <>
          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line py-12 text-center text-ink-faint">
              {q ? 'ไม่พบรีวิวที่ค้นหา' : 'ยังไม่มีรีวิว'}
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {data.items.map(r => (
                <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <Link to={`/books/${r.bookId}`} className="font-medium text-ink hover:text-cloth">{r.book?.title}</Link>
                      <StarDisplay value={r.rating} />
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">โดย {r.user.name} เมื่อ {dateTH(r.createdAt)}</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{r.comment}</p>
                  </div>
                  <button onClick={() => setTarget(r)} className="shrink-0 self-start text-sm text-red-700 hover:underline">ลบรีวิว</button>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title="ลบรีวิวนี้?" confirmText="ลบรีวิว"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>รีวิวของ {target?.user.name} ต่อ {target?.book?.title} จะถูกลบถาวร และคะแนนเฉลี่ยของเล่มจะคำนวณใหม่</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminReviews;
