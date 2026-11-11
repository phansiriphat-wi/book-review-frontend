import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCover from '../components/BookCover';
import BookGrid from '../components/BookGrid';
import { listBooks } from '../api/backend';
import { getBooks } from '../api/openlibrary';
import { useCategories } from '../data/categories';

const SHELF_SIZE = 5;
const SHELF_WIDTHS = ['w-[84%]', 'w-full', 'w-[78%]', 'w-[92%]', 'w-[82%]'];

// หน้าแรก: ชั้นหนังสือ (ปกจริง) + หนังสือที่สมาชิกให้คะแนนสูงสุด + เลือกตามหมวด
function Home() {
  const navigate = useNavigate();
  const categories = useCategories();
  const [query, setQuery] = useState('');
  const [shelf, setShelf] = useState([]);
  const [top, setTop] = useState([]);
  const [topStatus, setTopStatus] = useState('loading');
  const [topError, setTopError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const firstSubject = categories.find(c => c.olSubject)?.olSubject;

  // หนังสือที่มีรีวิวในระบบ เรียงตามคะแนน (Go: GET /api/books?sort=rating)
  useEffect(() => {
    let ignore = false;
    setTopStatus('loading');
    listBooks({ sort: 'rating', pageSize: 12 })
      .then(data => {
        if (ignore) return;
        setTop(data.items.filter(b => b.reviewCount > 0));
        setTopStatus('success');
      })
      .catch(err => { if (!ignore) { setTopError(err); setTopStatus('error'); } });
    return () => { ignore = true; };
  }, [reloadKey]);

  // ชั้นหนังสือ: ใช้เล่มที่สมาชิกรีวิวก่อน ไม่พอเติมจาก Open Library หมวดแรก (พลาดก็แค่ชั้นว่าง)
  useEffect(() => {
    if (topStatus === 'loading' || !firstSubject) return;
    let ignore = false;
    const reviewed = top.filter(b => b.coverUrl).slice(0, SHELF_SIZE);
    if (reviewed.length >= SHELF_SIZE) {
      setShelf(reviewed);
      return;
    }
    getBooks(firstSubject, 1)
      .then(data => {
        if (ignore) return;
        const seen = new Set(reviewed.map(b => b.openlibraryKey));
        const more = data.items.filter(b => b.coverUrl && !seen.has(b.openlibraryKey));
        setShelf([...reviewed, ...more].slice(0, SHELF_SIZE));
      })
      .catch(() => { if (!ignore) setShelf(reviewed); });
    return () => { ignore = true; };
  }, [top, topStatus, firstSubject]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books');
  }

  return (
    <div>
      <section className="border-b border-line bg-paper-shade">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-0 pt-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-6 md:pt-20">
          <div className="pb-12 md:pb-20">
            <h1 className="font-serif text-4xl font-bold leading-[1.2] text-ink md:text-5xl">
              รีวิวหนังสือจากคนที่อ่านจบแล้ว
            </h1>
            <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
              ค้นหนังสือหลายล้านเล่มจาก Open Library อ่านความเห็นของสมาชิก ให้คะแนน แล้วเก็บเล่มที่อยากอ่านไว้ในรายการของคุณ
            </p>
            <form onSubmit={handleSearch} role="search" className="mt-8 flex max-w-md gap-2">
              <label htmlFor="home-search" className="sr-only">ค้นชื่อหนังสือหรือผู้แต่ง</label>
              <input id="home-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder="เช่น Dune หรือ Agatha Christie"
                     className="min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-3 placeholder:text-ink-faint focus:border-cloth focus:outline-none focus:ring-2 focus:ring-cloth/20" />
              <button type="submit" className="rounded-md bg-cloth px-5 py-3 text-sm font-medium text-white hover:bg-cloth-dark">
                ค้นหา
              </button>
            </form>
          </div>

          {/* ชั้นหนังสือ: ปกจริงยืนเรียงบนแผ่นไม้ ขนาดต่างกันเล็กน้อยให้เหมือนหนังสือคนละเล่ม */}
          <div className="self-end" aria-label="หนังสือแนะนำ">
            <div className="grid grid-cols-4 items-end gap-3 px-2 sm:grid-cols-5 md:gap-5">
              {(shelf.length ? shelf : Array.from({ length: SHELF_SIZE }, (_, i) => ({ id: `ph${i}` }))).map((b, i) => (
                <Link key={b.id} to={b.title ? `/books/${b.id}` : '/books'}
                      tabIndex={b.title ? 0 : -1} aria-hidden={b.title ? undefined : true}
                      className={'shelf-in mx-auto block ' + SHELF_WIDTHS[i] + (i === SHELF_SIZE - 1 ? ' hidden sm:block' : '')}
                      style={{ animationDelay: `${i * 70}ms` }}>
                  {b.title ? <BookCover src={b.coverUrl} title={b.title} /> : <div className="aspect-[2/3] rounded-[3px] bg-line/60" />}
                </Link>
              ))}
            </div>
            <div className="h-3 rounded-t-sm bg-[#8C6B4A] shadow-[0_6px_10px_-4px_rgba(31,42,68,.45)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">สมาชิกให้คะแนนสูงสุด</h2>
            <p className="mt-1 text-sm text-ink-soft">คะแนนเฉลี่ยจากรีวิวของสมาชิกเว็บนี้</p>
          </div>
          <Link to="/books?source=library" className="shrink-0 text-sm text-cloth hover:underline">ดูทั้งหมด</Link>
        </div>
        <BookGrid books={top.slice(0, 6)} status={topStatus} error={topError} onRetry={() => setReloadKey(k => k + 1)}
                  empty={<>ยังไม่มีรีวิว <Link to="/books" className="text-cloth underline">เลือกหนังสือสักเล่ม</Link> แล้วเป็นคนแรกที่รีวิว</>} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <h2 className="font-serif text-2xl font-bold text-ink">เลือกตามหมวด</h2>
        <ul className="mt-5 grid grid-cols-2 gap-x-8 sm:grid-cols-4">
          {categories.filter(c => c.olSubject).map(c => (
            <li key={c.name} className="border-b border-line">
              <Link to={`/books?category=${encodeURIComponent(c.name)}`}
                    className="flex items-baseline justify-between py-3 text-ink hover:text-cloth">
                <span className="font-medium">{c.nameTh}</span>
                <span className="text-xs text-ink-faint">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Home;
