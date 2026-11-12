import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { createBook, deleteBook, getAdminBook, updateBook } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnGhost, btnDanger, inputClass, labelClass } from '../../components/admin/AdminStates';
import BookCover from '../../components/BookCover';
import { useCategories } from '../../data/categories';



const EMPTY = { title: '', author: '', category: '', description: '', coverUrl: '', publishedYear: '', openlibraryKey: '' };
const THIS_YEAR = new Date().getFullYear();


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


  function set(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      if (errors[field]) setErrors({ ...errors, [field]: undefined });
    };
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
