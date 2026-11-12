import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import BookCover from '../components/BookCover';
import PeekBuddy from '../components/mascot/PeekBuddy';
import BookShelfCarousel from '../components/home/BookShelfCarousel';
import { listBooks } from '../api/backend';
import { useCategories } from '../data/categories';

const HERO_SIZE = 5;                                         // ชั้นปกจริงในส่วนหัว (แบบเดิม)
const SHELF_SIZE = 15;                                       // รวมกับชั้น 3 มิติด้านล่าง
const HERO_WIDTHS = ['w-[84%]', 'w-full', 'w-[78%]', 'w-[92%]', 'w-[82%]'];
const PEEK_AT = 3;                                           // น้องบุ๊คแอบหลังเล่มที่ 4 (เห็นทั้งจอมือถือและจอใหญ่)

// เล่มที่มีปกขึ้นชั้นก่อน เล่มไม่มีปกใช้ปกสำรอง
export function pickShelf(books, size = SHELF_SIZE) {
  return [...books.filter(b => b.coverUrl), ...books.filter(b => !b.coverUrl)].slice(0, size);
}

// หน้าแรก (โทนอบอุ่น ครีม–น้ำตาล แบบกระจก):
// ส่วนหัวพร้อมชั้นปกจริงแบบเดิม, ชั้นหนังสือ 3 มิติแบบเลื่อนได้, หมวดหมู่, หนังสือที่สมาชิกให้คะแนนสูงสุด
function Home() {
  const navigate = useNavigate();
  const categories = useCategories();
  const [query, setQuery] = useState('');
  const [shelf, setShelf] = useState([]);
  const [shelfStatus, setShelfStatus] = useState('loading');
  const [top, setTop] = useState([]);
  const [topStatus, setTopStatus] = useState('loading');
  const [topError, setTopError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ชั้นหนังสือ: หนังสือทั้งหมดใน Supabase ไม่จำกัดเฉพาะเล่มที่มีรีวิว
  useEffect(() => {
    let ignore = false;
    setShelfStatus('loading');
    listBooks({ pageSize: 48 })
      .then(data => {
        if (ignore) return;
        setShelf(pickShelf(data.items));
        setShelfStatus('success');
      })
      .catch(() => {
        if (ignore) return;
        setShelf([]);
        setShelfStatus('error');
      });
    return () => { ignore = true; };
  }, [reloadKey]);

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

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books');
  }

  // 5 เล่มแรกยืนบนชั้นในส่วนหัว ที่เหลือไปอยู่ชั้น 3 มิติ (ถ้าเหลือน้อยเกินไป ใช้ทั้งหมด)
  const hero = shelf.slice(0, HERO_SIZE);
  const rest = shelf.slice(HERO_SIZE);
  const carousel = rest.length >= 4 ? rest : shelf;

  return (
    <div className="relative overflow-hidden font-warm text-cocoa">
      <span aria-hidden="true" className="warm-blob -right-32 -top-40 h-[520px] w-[520px] bg-sky opacity-75 dark:opacity-50" />
      <span aria-hidden="true" className="warm-blob -left-40 top-[380px] h-[420px] w-[420px] bg-cream-deep opacity-90 dark:opacity-60" />
      <span aria-hidden="true" className="warm-blob -right-36 top-[1200px] h-[460px] w-[460px] bg-latte opacity-60 dark:opacity-30" />

      {/* ส่วนหัว: ข้อความ + ค้นหา ซ้าย / ปกจริงยืนเรียงบนแผ่นไม้ ขวา (เลย์เอาต์เดิม โทนใหม่) */}
      <section className="relative border-b border-latte/70">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-0 pt-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-6 md:pt-20">
          <div className="pb-12 md:pb-20">
            <h1 className="font-round text-4xl leading-[1.2] md:text-5xl">
              รีวิวหนังสือจากคนที่อ่านจบแล้ว
            </h1>
            <p className="mt-5 max-w-md leading-relaxed text-cocoa-soft">
              ค้นหนังสือในคลังของเรา อ่านความเห็นของสมาชิก ให้คะแนน แล้วเก็บเล่มที่อยากอ่านไว้ในรายการของคุณ
            </p>
            <form onSubmit={handleSearch} role="search" className="glass mt-8 flex max-w-md gap-2 rounded-[18px] p-2">
              <label htmlFor="home-search" className="sr-only">ค้นชื่อหนังสือหรือผู้แต่ง</label>
              <input id="home-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder="เช่น Dune หรือ Agatha Christie"
                     className="min-h-12 min-w-0 flex-1 rounded-xl border-0 bg-white/60 px-4 text-base text-cocoa placeholder:text-cocoa-soft/80 focus:outline-none focus:ring-2 focus:ring-caramel/40" />
              <button type="submit"
                      className="lift min-h-12 rounded-xl bg-caramel px-5 font-semibold text-on-accent shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-caramel-dark">
                ค้นหา
              </button>
            </form>
          </div>

          <div className="self-end" aria-label="หนังสือแนะนำ">
            <div className="grid grid-cols-4 items-end gap-3 px-2 sm:grid-cols-5 md:gap-5">
              {(hero.length ? hero : Array.from({ length: HERO_SIZE }, (_, i) => ({ id: `ph${i}` }))).map((b, i) => (
                <div key={b.id} className={'relative mx-auto ' + HERO_WIDTHS[i] + (i === HERO_SIZE - 1 ? ' hidden sm:block' : '')}>
                  {i === PEEK_AT && <PeekBuddy />}
                  <Link to={b.title ? `/books/${b.id}` : '/books'}
                        tabIndex={b.title ? 0 : -1} aria-hidden={b.title ? undefined : true}
                        className="shelf-in group relative z-10 block"
                        style={{ animationDelay: `${i * 70}ms` }}>
                    {b.title
                      ? <BookCover src={b.coverUrl} title={b.title}
                                   className="origin-bottom transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-2" />
                      : <div className={'aspect-[2/3] rounded-[3px] ' + (shelfStatus === 'loading' ? 'shimmer' : 'bg-latte/40')} />}
                  </Link>
                </div>
              ))}
            </div>
            <div className="h-3 rounded-t-sm bg-caramel-wood shadow-[0_6px_10px_-4px_rgba(59,49,42,.45)]" />
          </div>
        </div>
      </section>

      {/* ชั้นหนังสือ 3 มิติ */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 md:px-6">
        <BookShelfCarousel books={carousel} status={shelfStatus === 'loading' ? 'loading' : 'success'} />
      </section>

      {/* หมวดหมู่ */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <h2 className="font-round text-2xl">เลือกตามหมวด</h2>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {categories.map(c => (
            <li key={c.name}>
              <Link to={`/books?category=${encodeURIComponent(c.name)}`}
                    className="lift inline-flex min-h-11 items-center rounded-2xl border border-latte-deep/60 bg-white/85 px-4 text-cocoa shadow-[0_4px_12px_-6px_rgba(59,49,42,.35)] hover:border-caramel hover:bg-cocoa hover:text-cream">
                {c.nameTh}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* คะแนนสูงสุด */}
      <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-16 md:px-6">
        <div className="glass rounded-[28px] p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-round text-2xl">สมาชิกให้คะแนนสูงสุด</h2>
              <p className="mt-1 text-sm text-cocoa-soft">คะแนนเฉลี่ยจากรีวิวของสมาชิกเว็บนี้</p>
            </div>
            <Link to="/books" className="shrink-0 text-sm font-semibold text-caramel hover:text-caramel-dark">ดูทั้งหมด</Link>
          </div>
          <BookGrid books={top.slice(0, 6)} status={topStatus} error={topError} onRetry={() => setReloadKey(k => k + 1)}
                    empty={<>ยังไม่มีรีวิว <Link to="/books" className="text-caramel underline">เลือกหนังสือสักเล่ม</Link> แล้วเป็นคนแรกที่รีวิว</>} />
        </div>
      </section>
    </div>
  );
}

export default Home;
