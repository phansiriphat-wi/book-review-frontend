import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { deleteBook, getAdminBook, listBooks } from '../../api/backend';
import { ErrorBox, Loading, Notice, ConfirmBox, btnPrimary, inputClass } from '../../components/admin/AdminStates';
import Pagination from '../../components/Pagination';
import BookCover from '../../components/BookCover';
import { StarDisplay } from '../../components/StarRating';
import { categoryLabel, useCategories } from '../../data/categories';

const PAGE_SIZE = 20;

// ตารางหนังสือในระบบ: ค้นหา กรองหมวด แบ่งหน้า (ค้นที่ Go)  แก้ไขไปหน้าฟอร์ม ลบมีกล่องยืนยันบอกผลกระทบ
function AdminBooks() {
  const { token } = useAuth();
  const location = useLocation();
  const categories = useCategories();
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);           // { book, impact } ที่กำลังจะลบ
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const result = await listBooks({ q, category, page, pageSize: PAGE_SIZE });
        if (!ignore) { setData(result); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [q, category, page, reloadKey]);

  async function askDelete(book) {
    setNotice(null);
    try {
      const { impact } = await getAdminBook(book.id, token);
      setTarget({ book, impact });
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteBook(target.book.id, token);
      setNotice({ tone: 'success', text: `ลบ ${target.book.title} แล้ว` });
      setTarget(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">หนังสือในระบบ</h2>
          {status === 'success' && <p className="text-sm text-ink-soft">ทั้งหมด {data.total.toLocaleString('th-TH')} เล่ม</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form onSubmit={(e) => { e.preventDefault(); setQ(draft.trim()); setPage(1); }} role="search">
            <label htmlFor="admin-books-q" className="sr-only">ค้นชื่อหนังสือหรือผู้แต่ง</label>
            <input id="admin-books-q" type="search" value={draft} onChange={(e) => setDraft(e.target.value)}
                   placeholder="ค้นชื่อหนังสือหรือผู้แต่ง" className={inputClass + ' sm:w-60'} />
          </form>
          <label htmlFor="admin-books-cat" className="sr-only">หมวดหมู่</label>
          <select id="admin-books-cat" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className={inputClass + ' sm:w-44'}>
            <option value="">ทุกหมวด</option>
            {categories.map(c => <option key={c.name} value={c.name}>{c.nameTh}</option>)}
          </select>
          <Link to="/admin/books/new" className={btnPrimary + ' whitespace-nowrap'}>เพิ่มหนังสือ</Link>
        </div>
      </div>

      {notice && <div className="mb-4"><Notice tone={notice.tone ?? 'success'}>{notice.text ?? notice}</Notice></div>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-paper-shade text-left text-xs text-ink-soft">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">หนังสือ</th>
                  <th scope="col" className="px-4 py-3 font-medium">หมวด</th>
                  <th scope="col" className="px-4 py-3 font-medium">ปี</th>
                  <th scope="col" className="px-4 py-3 font-medium">คะแนน</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map(b => (
                  <tr key={b.id} className="hover:bg-paper-shade/60">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 shrink-0"><BookCover src={b.coverUrl} title={b.title} /></div>
                        <div className="min-w-0">
                          <Link to={`/books/${b.id}`} className="block max-w-xs truncate font-medium text-ink hover:text-cloth">{b.title}</Link>
                          <p className="max-w-xs truncate text-xs text-ink-soft">{b.author} <span className="text-ink-faint">#{b.id}{b.openlibraryKey && ` ${b.openlibraryKey}`}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-ink-soft">{categoryLabel(b.category, categories)}</td>
                    <td className="px-4 py-2 text-ink-soft">{b.publishedYear ?? '-'}</td>
                    <td className="px-4 py-2">{b.avgRating != null ? <StarDisplay value={b.avgRating} /> : <span className="text-ink-faint">-</span>}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <Link to={`/admin/books/${b.id}`} className="text-cloth hover:underline">แก้ไข</Link>
                      <button onClick={() => askDelete(b)} className="ml-4 text-red-700 hover:underline">ลบ</button>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-faint">
                    {q || category ? 'ไม่พบหนังสือที่ค้นหา' : 'ยังไม่มีหนังสือในระบบ กดเพิ่มหนังสือเพื่อเริ่ม'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ลบ ${target?.book.title}?`} confirmText="ลบหนังสือ"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>รีวิว {target?.impact.reviews ?? 0} รายการ และรายการอยากอ่าน {target?.impact.wishlists ?? 0} รายการของเล่มนี้จะถูกลบไปด้วย ย้อนกลับไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminBooks;
