import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import { getBooks, searchBooks, PAGE_SIZE } from '../api/openlibrary';
import { forget } from '../api/cache';
import { getRatings, listBooks } from '../api/backend';
import { useCategories } from '../data/categories';

// หน้ารายการหนังสือ 2 แหล่ง (แนวเดียวกับ Movies.jsx ของ MovieHub)
//   source=ol       ค้นจาก Open Library โดยตรง (ค่าเริ่มต้น) เลือกหมวด = subject ของ Open Library
//   source=library  หนังสือที่มีในระบบของเรา (เคยมีคนรีวิว/เพิ่ม wishlist หรือ admin เพิ่ม) จาก Go
// สถานะทั้งหมดอยู่ใน URL (?q=&category=&page=&source=) กด back แล้วกลับมาที่เดิม และแชร์ลิงก์ได้
function Books() {
  const [params, setParams] = useSearchParams();
  const source = params.get('source') === 'library' ? 'library' : 'ol';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const categories = useCategories();
  const olCategories = categories.filter(c => c.olSubject);

  // Open Library ต้องมีคำค้นหรือหมวดเสมอ ไม่ค้นและไม่เลือกหมวด = หมวดแรก
  const category = params.get('category') ?? (source === 'ol' && !q ? olCategories[0]?.name ?? '' : '');
  const subject = categories.find(c => c.name === category)?.olSubject ?? null;

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
        let result;
        if (source === 'library') {
          result = await listBooks({ q, category, page, pageSize: PAGE_SIZE });
        } else if (q) {
          result = await searchBooks(q, page, subject);
        } else {
          result = await getBooks(subject, page);     // วันละครั้งต่อหมวดต่อหน้า (cache.js)
        }
        if (ignore) return;
        setBooks(result.items);
        setTotal(result.total);
        setStatus('success');

        // คะแนนเฉลี่ยจากสมาชิกเว็บเรา สำหรับการ์ด Open Library (พลาดก็แค่ไม่แสดงดาว)
        if (source === 'ol' && result.items.length) {
          const ratings = await getRatings(result.items.map(b => b.openlibraryKey)).catch(() => []);
          if (!ignore && ratings.length) {
            const byKey = Object.fromEntries(ratings.map(r => [r.openlibraryKey, r]));
            setBooks(result.items.map(b => byKey[b.id] ? { ...b, avgRating: byKey[b.id].avgRating, reviewCount: byKey[b.id].reviewCount } : b));
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    if (source === 'ol' && !q && !subject) return;     // รอหมวดโหลด
    load();
    return () => { ignore = true; };                  // cleanup: effect รอบเก่าถูกยกเลิก
  }, [source, q, category, subject, page, reloadKey]);

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v == null) next.delete(k); else next.set(k, v);
    }
    if (!('page' in changes)) next.delete('page');     // เปลี่ยนตัวกรอง = กลับหน้า 1
    setParams(next);
  }

  function handleSearch(e) {
    e.preventDefault();
    update({ q: draft.trim(), category: source === 'ol' ? '' : category });
  }

  function retry() {
    if (source === 'ol' && !q) forget(`bookreview.ol.${subject}.${page}`);
    setReloadKey(k => k + 1);
  }

  const chips = source === 'library' ? [{ name: '', nameTh: 'ทุกหมวด' }, ...categories]
    : [...(q ? [{ name: '', nameTh: 'ทุกหมวด' }] : []), ...olCategories];
  const chipClass = (active) =>
    'rounded-full border px-3.5 py-1.5 text-sm transition ' +
    (active ? 'border-cloth bg-cloth text-white' : 'border-line bg-white text-ink-soft hover:border-cloth hover:text-cloth');
  const tabClass = (active) =>
    'border-b-2 px-1 pb-2 text-sm ' + (active ? 'border-cloth font-medium text-ink' : 'border-transparent text-ink-soft hover:text-ink');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">หนังสือ</h1>
          <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
            {status === 'success'
              ? `${q ? `ผลค้นหา "${q}" ` : ''}พบ ${total.toLocaleString('th-TH')} เล่ม`
              : status === 'loading' ? 'กำลังค้นหา...' : ' '}
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

      <div className="mt-6 flex gap-6 border-b border-line" role="tablist" aria-label="แหล่งข้อมูล">
        <button role="tab" aria-selected={source === 'ol'} className={tabClass(source === 'ol')}
                onClick={() => update({ source: '', category: '' })}>
          จาก Open Library
        </button>
        <button role="tab" aria-selected={source === 'library'} className={tabClass(source === 'library')}
                onClick={() => update({ source: 'library', category: '' })}>
          มีรีวิวในเว็บนี้
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="หมวดหมู่">
        {chips.map(c => (
          <button key={c.name || 'all'} onClick={() => update({ category: c.name })}
                  aria-pressed={category === c.name} className={chipClass(category === c.name)}>
            {c.nameTh}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <BookGrid books={books} status={status} error={error} onRetry={retry} category={category || undefined}
                  empty={source === 'library' && !q && !category
                    ? 'ยังไม่มีหนังสือในระบบ เลือกแท็บ "จาก Open Library" แล้วเป็นคนแรกที่รีวิว'
                    : undefined} />
        {status === 'success' && (
          <Pagination page={page} total={total} pageSize={PAGE_SIZE}
                      onChange={(p) => { update({ page: p > 1 ? p : '' }); window.scrollTo({ top: 0 }); }} />
        )}
      </div>
    </div>
  );
}

export default Books;
