import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import { listBooks } from '../api/backend';
import { useCategories } from '../data/categories';

export const PAGE_SIZE = 24;   // Go รับได้สูงสุดหน้าละ 48


function Books() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const categories = useCategories();

  const [draft, setDraft] = useState(q);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');     // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);       // ตัวนับสำหรับปุ่ม "ลองใหม่"

  useEffect(() => { setDraft(q); }, [q]);

  useEffect(() => {
    let ignore = false;                                // ธงกันคำตอบเก่ามาทับคำตอบใหม่
    async function load() {
      setStatus('loading');
      try {
        const result = await listBooks({ q, category, page, pageSize: PAGE_SIZE });
        if (ignore) return;
        setBooks(result.items);
        setTotal(result.total);
        setStatus('success');
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => { ignore = true; };                  // cleanup: effect รอบเก่าถูกยกเลิก
  }, [q, category, page, reloadKey]);

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v == null) next.delete(k); else next.set(k, v);
    }
    if (!('page' in changes)) next.delete('page');     // เปลี่ยนตัวกรอง = กลับหน้า 1
    next.delete('source');                             // ลิงก์เก่าที่มี ?source= ไม่ใช้แล้ว
    setParams(next);
  }

  function handleSearch(e) {
    e.preventDefault();
    update({ q: draft.trim() });
  }

  const chips = [{ name: '', nameTh: 'ทุกหมวด' }, ...categories];
  const chipClass = (active) =>
    'rounded-full border px-3.5 py-1.5 text-sm transition ' +
    (active ? 'border-cocoa bg-cocoa font-semibold text-cream shadow-[0_6px_14px_-6px_rgba(59,49,42,.6)]'
      : 'border-latte-deep/60 bg-white text-ink-soft shadow-[0_2px_6px_-3px_rgba(59,49,42,.25)] hover:border-caramel hover:text-cloth-dark');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">หนังสือ</h1>
          <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
            {status === 'success'
              ? `${q ? `ผลค้นหา "${q}" ` : ''}พบ ${total.toLocaleString('th-TH')} เล่ม`
              : status === 'loading' ? 'กำลังโหลด...' : ' '}
          </p>
        </div>
        <form onSubmit={handleSearch} role="search" className="flex w-full gap-2 md:w-96">
          <label htmlFor="books-search" className="sr-only">ค้นชื่อหนังสือหรือผู้แต่ง</label>
          <input id="books-search" type="search" value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
            className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 placeholder:text-ink-faint focus:border-cloth focus:outline-none focus:ring-2 focus:ring-cloth/20" />
          <button type="submit" className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-white hover:bg-cloth-dark">ค้นหา</button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="หมวดหมู่">
        {chips.map(c => (
          <button key={c.name || 'all'} onClick={() => update({ category: c.name })}
            aria-pressed={category === c.name} className={chipClass(category === c.name)}>
            {c.nameTh}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <BookGrid books={books} status={status} error={error} onRetry={() => setReloadKey(k => k + 1)}
          category={category || undefined}
          empty={q || category
            ? 'ไม่พบหนังสือที่ค้นหา ลองใช้คำอื่นหรือเลือกหมวดอื่น'
            : 'ยังไม่มีหนังสือในระบบ'} />
        {status === 'success' && (
          <Pagination page={page} total={total} pageSize={PAGE_SIZE}
            onChange={(p) => { update({ page: p > 1 ? p : '' }); window.scrollTo({ top: 0 }); }} />
        )}
      </div>
    </div>
  );
}

export default Books;
