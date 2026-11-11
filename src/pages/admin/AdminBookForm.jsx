import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { createBook, deleteBook, getAdminBook, updateBook } from '../../api/backend';
import { getBook as getOpenLibraryBook, searchBooks } from '../../api/openlibrary';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnGhost, btnDanger, inputClass, labelClass } from '../../components/admin/AdminStates';
import BookCover from '../../components/BookCover';
import { useCategories } from '../../data/categories';

// ฟอร์มเดียวใช้ 2 โหมด: ไม่มี :id = เพิ่มหนังสือใหม่, มี :id = แก้ไข (โหลดค่าเดิมมาใส่ก่อน) แบบ AdminMovieForm
// ฟอร์มเช็กข้อมูลชั้นแรกให้ผู้ใช้เห็นเร็ว แต่ Go เช็กซ้ำทุกครั้ง เพราะฟอร์มนี้ข้ามได้ด้วย curl

const EMPTY = { title: '', author: '', category: '', description: '', coverUrl: '', publishedYear: '', openlibraryKey: '' };
const THIS_YEAR = new Date().getFullYear();

// ลิงก์รูปปก: กติกาเดียวกับ Go (url.Parse แล้ว scheme ต้องเป็น https มี host และยาวไม่เกิน 500)
export function isHttpsUrl(value) {
  const v = String(value ?? '').trim();
  if (!v || v.length > 500) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && Boolean(u.host);
  } catch {
    return false;
  }
}

// กติกาเดียวกับ validateBook ใน Go (handler/validate.go)
export function validate(f) {
  const errs = {};
  if (!f.title.trim()) errs.title = 'ต้องมีชื่อหนังสือ';
  else if (f.title.trim().length > 255) errs.title = 'ยาวไม่เกิน 255 ตัวอักษร';
  if (!f.author.trim()) errs.author = 'ต้องมีชื่อผู้แต่ง';
  else if (f.author.trim().length > 255) errs.author = 'ยาวไม่เกิน 255 ตัวอักษร';
  if (!f.category) errs.category = 'เลือกหมวดหมู่';
  if (f.description.trim().length > 5000) errs.description = 'ยาวไม่เกิน 5000 ตัวอักษร';
  if (f.coverUrl.trim() && !isHttpsUrl(f.coverUrl)) errs.coverUrl = 'ต้องเป็นลิงก์ที่ขึ้นต้นด้วย https:// (ยาวไม่เกิน 500 ตัวอักษร)';
  if (f.publishedYear !== '' && !(/^\d{1,4}$/.test(String(f.publishedYear)) && Number(f.publishedYear) >= 1 && Number(f.publishedYear) <= THIS_YEAR + 1)) {
    errs.publishedYear = `ปีต้องอยู่ระหว่าง 1 ถึง ${THIS_YEAR + 1}`;
  }
  if (f.openlibraryKey.trim() && !/^OL\d+W$/.test(f.openlibraryKey.trim())) errs.openlibraryKey = 'รูปแบบ OL12345W';
  return errs;
}

// แปลงค่าจากฟอร์ม (string ทั้งหมด) เป็น JSON ที่ Go ต้องการ (ว่าง = null, ปี = ตัวเลข)
function toPayload(f) {
  const nz = (s) => (s && String(s).trim() ? String(s).trim() : null);
  return {
    title: f.title.trim(),
    author: f.author.trim(),
    category: f.category,
    description: nz(f.description),
    coverUrl: nz(f.coverUrl),
    publishedYear: f.publishedYear === '' ? null : Number(f.publishedYear),
    openlibraryKey: nz(f.openlibraryKey),
  };
}

// กล่องค้น Open Library เพื่อกรอกฟอร์มอัตโนมัติ
function OpenLibraryPicker({ onPick }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');         // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(null);

  async function search(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setStatus('loading');
    try {
      const data = await searchBooks(q.trim(), 1);
      setResults(data.items.slice(0, 8));
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }

  async function pick(b) {
    setPicking(b.id);
    try {
      const full = await getOpenLibraryBook(b.id).catch(() => b);   // ได้เรื่องย่อ ถ้าพลาดใช้ข้อมูลจากผลค้นหา
      onPick({ ...b, ...full, author: b.author !== 'ไม่ทราบผู้แต่ง' ? b.author : full.author,
               publishedYear: b.publishedYear ?? full.publishedYear, coverUrl: full.coverUrl ?? b.coverUrl });
    } finally {
      setPicking(null);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-paper-shade p-4">
      <p className="text-sm font-medium text-ink">กรอกจาก Open Library</p>
      <p className="text-xs text-ink-soft">ค้นแล้วเลือกเล่ม ระบบจะเติมชื่อ ผู้แต่ง ปี ปก และเรื่องย่อให้ แก้ต่อได้ก่อนบันทึก</p>
      <form onSubmit={search} className="mt-3 flex gap-2" role="search">
        <label htmlFor="ol-picker" className="sr-only">ค้นใน Open Library</label>
        <input id="ol-picker" type="search" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="ชื่อหนังสือหรือผู้แต่ง" className={inputClass} />
        <button type="submit" className={btnGhost} disabled={status === 'loading'}>ค้นหา</button>
      </form>
      {status === 'loading' && <p className="mt-3 text-sm text-ink-faint">กำลังค้นหา...</p>}
      {status === 'error' && <p className="mt-3 text-sm text-red-700">{error.message}</p>}
      {status === 'success' && results.length === 0 && <p className="mt-3 text-sm text-ink-faint">ไม่พบหนังสือ ลองคำอื่น</p>}
      {results.length > 0 && status === 'success' && (
        <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto rounded-md border border-line bg-white">
          {results.map(b => (
            <li key={b.id}>
              <button type="button" onClick={() => pick(b)} disabled={picking !== null}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-paper-shade disabled:opacity-60">
                <div className="w-8 shrink-0"><BookCover src={b.coverUrl} title={b.title} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{b.title}</p>
                  <p className="truncate text-xs text-ink-soft">{b.author}{b.publishedYear && `, ${b.publishedYear}`}</p>
                </div>
                <span className="text-xs text-cloth">{picking === b.id ? 'กำลังดึง...' : 'เลือก'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminBookForm() {
  const { id } = useParams();                           // undefined = โหมดเพิ่ม
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const categories = useCategories();

  const [form, setForm] = useState(EMPTY);
  const [impact, setImpact] = useState(null);
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready');   // 'loading' | 'ready' | 'error'
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});             // error รายช่องจากการเช็กในเบราว์เซอร์
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    getAdminBook(id, token)
      .then(({ book, impact }) => {
        if (ignore) return;
        setForm({
          title: book.title ?? '', author: book.author ?? '', category: book.category ?? '',
          description: book.description ?? '', coverUrl: book.coverUrl ?? '',
          publishedYear: book.publishedYear != null ? String(book.publishedYear) : '',
          openlibraryKey: book.openlibraryKey ?? '',
        });
        setImpact(impact);
        setStatus('ready');
      })
      .catch(err => { if (!ignore) { setLoadError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [id, isEdit, token]);

  // ช่องเดียวเปลี่ยน ก็สร้าง object ใหม่ที่ก็อปของเดิมแล้วทับช่องนั้น (ไม่แก้ state ตรง ๆ)
  function set(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      if (errors[field]) setErrors({ ...errors, [field]: undefined });
    };
  }

  function fillFromOpenLibrary(b) {
    setForm(f => ({
      ...f,
      title: b.title ?? f.title,
      author: b.author && b.author !== 'ไม่ทราบผู้แต่ง' ? b.author : f.author,
      description: b.description ?? f.description,
      coverUrl: b.coverUrl ?? f.coverUrl,
      publishedYear: b.publishedYear != null ? String(b.publishedYear) : f.publishedYear,
      openlibraryKey: b.openlibraryKey ?? f.openlibraryKey,
    }));
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setServerError(null);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const saved = isEdit ? await updateBook(id, toPayload(form), token) : await createBook(toPayload(form), token);
      navigate('/admin/books', { state: { notice: `${isEdit ? 'บันทึกการแก้ไข' : 'เพิ่ม'} ${saved.title} แล้ว` } });
    } catch (err) {
      setServerError(err.message);                     // 400 / 409 จาก Go
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBook(id, token);
      navigate('/admin/books', { state: { notice: `ลบ ${form.title} แล้ว` } });
    } catch (err) {
      setServerError(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const field = (name) => ({
    id: `book-${name}`, value: form[name], onChange: set(name), disabled: saving,
    'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `book-${name}-err` : undefined,
    className: inputClass + (errors[name] ? ' border-red-400' : ''),
  });
  const err = (name) => errors[name] && <p id={`book-${name}-err`} className="mt-1 text-xs text-red-600">{errors[name]}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink">{isEdit ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือ'}</h2>
          <Link to="/admin/books" className="text-sm text-ink-soft hover:text-cloth">กลับไปรายการ</Link>
        </div>

        {/* อยู่นอกฟอร์มหนังสือ เพราะกล่องค้นหาเป็น <form> ของตัวเอง (ซ้อน form ไม่ได้) */}
        {!isEdit && <OpenLibraryPicker onPick={fillFromOpenLibrary} />}

        <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label={isEdit ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือ'}>
          <div>
            <label htmlFor="book-title" className={labelClass}>ชื่อหนังสือ</label>
            <input {...field('title')} />{err('title')}
          </div>
          <div>
            <label htmlFor="book-author" className={labelClass}>ผู้แต่ง</label>
            <input {...field('author')} />{err('author')}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="book-category" className={labelClass}>หมวดหมู่</label>
              <select {...field('category')}>
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.nameTh} ({c.name})</option>)}
              </select>{err('category')}
            </div>
            <div>
              <label htmlFor="book-publishedYear" className={labelClass}>ปีที่พิมพ์ครั้งแรก</label>
              <input {...field('publishedYear')} inputMode="numeric" placeholder="เช่น 1965" />{err('publishedYear')}
            </div>
          </div>
          <div>
            <label htmlFor="book-coverUrl" className={labelClass}>ลิงก์รูปปก</label>
            <input {...field('coverUrl')} type="url" placeholder="https://covers.openlibrary.org/b/id/....jpg" />{err('coverUrl')}
          </div>
          <div>
            <label htmlFor="book-openlibraryKey" className={labelClass}>รหัส Open Library (ไม่บังคับ)</label>
            <input {...field('openlibraryKey')} placeholder="OL27448W" />{err('openlibraryKey')}
          </div>
          <div>
            <label htmlFor="book-description" className={labelClass}>เรื่องย่อ</label>
            <textarea {...field('description')} rows={7} />{err('description')}
            <p className="mt-1 text-right text-xs text-ink-faint">{form.description.trim().length}/5000</p>
          </div>

          {serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
            </button>
            <Link to="/admin/books" className={btnGhost}>ยกเลิก</Link>
            {isEdit && (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={saving} className={btnDanger + ' ml-auto'}>
                ลบหนังสือ
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="lg:pt-12">
        <p className="mb-2 text-sm text-ink-soft">ตัวอย่างปก</p>
        <div className="w-40 lg:w-full"><BookCover key={form.coverUrl} src={isHttpsUrl(form.coverUrl) ? form.coverUrl.trim() : null} title={form.title || 'ชื่อหนังสือ'} size="lg" /></div>
        {isEdit && impact && (
          <p className="mt-4 text-sm text-ink-soft">เล่มนี้มีรีวิว {impact.reviews} รายการ และอยู่ในรายการอยากอ่าน {impact.wishlists} คน</p>
        )}
      </aside>

      <ConfirmBox open={confirmDelete} busy={deleting} title={`ลบ ${form.title}?`} confirmText="ลบหนังสือ"
                  onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        <p>รีวิว {impact?.reviews ?? 0} รายการ และรายการอยากอ่าน {impact?.wishlists ?? 0} รายการของเล่มนี้จะถูกลบไปด้วย ย้อนกลับไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminBookForm;
