import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ShelfBook from './ShelfBook';
import { StarDisplay } from '../StarRating';

const TILT_MS = 360;

// ชั้นหนังสือแบบเลื่อนได้: ปุ่มลูกศร, จุดบอกหน้า, ปัดด้วยนิ้ว/เมาส์ และปุ่มลูกศรบนคีย์บอร์ดเมื่อโฟกัสชั้น
// ตอนเลื่อน หนังสือทุกเล่มเอียงตามทิศ (class is-next / is-prev) แล้วเด้งกลับ
function BookShelfCarousel({ books, status, label = 'ชั้นหนังสือแนะนำ' }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState('');
  const [metrics, setMetrics] = useState({ step: 0, maxIndex: 0 });
  const tiltTimer = useRef();
  const dragStart = useRef(null);

  // วัดระยะเลื่อนต่อ 1 เล่ม และจำนวนเล่มที่เห็นในจอ ทุกครั้งที่ขนาดเปลี่ยน
  const measure = useCallback(() => {
    const track = trackRef.current;
    const vp = viewportRef.current;
    if (!track || !vp || track.children.length < 2) return setMetrics({ step: 0, maxIndex: 0 });
    const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
    const visible = step > 0 ? Math.max(1, Math.floor((vp.clientWidth - 32) / step)) : track.children.length;
    setMetrics({ step, maxIndex: Math.max(0, track.children.length - visible) });
  }, []);

  useLayoutEffect(() => { measure(); }, [measure, books.length, status]);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !viewportRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [measure]);
  useEffect(() => () => clearTimeout(tiltTimer.current), []);

  const i = Math.min(index, metrics.maxIndex);
  const go = (to) => {
    const next = Math.max(0, Math.min(metrics.maxIndex, to));
    if (next === i) return;
    setDir(next > i ? 'is-next' : 'is-prev');
    setIndex(next);
    clearTimeout(tiltTimer.current);
    tiltTimer.current = setTimeout(() => setDir(''), TILT_MS);
  };

  function onKeyDown(e) {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  }
  function onPointerDown(e) { dragStart.current = e.clientX; }
  function onPointerUp(e) {
    if (dragStart.current == null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / (metrics.step || 200))));
  }

  const loading = status === 'loading';
  const pages = metrics.maxIndex + 1;

  return (
    <div className="glass rounded-[28px] px-2 pb-7 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 md:px-6">
        <div>
          <h2 className="font-round text-2xl text-cocoa md:text-3xl">{label}</h2>
          <p className="mt-1 text-cocoa-soft">ชี้ที่หนังสือเพื่อเปิดปก เลื่อนชั้นด้วยลูกศรหรือปัด</p>
        </div>
        <div className="flex gap-2.5">
          <button type="button" className="glass shelf-nav" onClick={() => go(i - 1)} disabled={i === 0} aria-label="เลื่อนไปทางซ้าย">
            <Chevron d="M15 18l-6-6 6-6" />
          </button>
          <button type="button" className="glass shelf-nav" onClick={() => go(i + 1)} disabled={i >= metrics.maxIndex} aria-label="เลื่อนไปทางขวา">
            <Chevron d="M9 18l6-6-6-6" />
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="overflow-hidden focus-visible:ring-offset-cream" tabIndex={0} role="region"
           aria-roledescription="carousel" aria-label={label} aria-busy={loading || undefined}
           onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerUp={onPointerUp}
           onPointerCancel={() => { dragStart.current = null; }}>
        <ul ref={trackRef} className={'shelf-track ' + dir}
            style={{ transform: `translateX(-${i * metrics.step}px)` }}>
          {loading
            ? Array.from({ length: 6 }, (_, k) => (
                <li key={k} className="shelf-slot" aria-hidden="true">
                  <div className="shimmer mx-auto aspect-[2/3] w-[var(--w)] rounded-md" />
                  <div className="shimmer mx-auto mt-4 h-4 w-3/4 rounded" />
                </li>
              ))
            : books.map((b, k) => (
                <li key={b.id} className="shelf-slot" style={{ animationDelay: `${Math.min(k, 8) * 90}ms` }}>
                  <ShelfBook book={b} index={k} />
                  <div className="shelf-info">
                    <h3 className="line-clamp-2 font-round text-[15px] leading-snug text-cocoa" title={b.title}>{b.title}</h3>
                    <p className="mt-0.5 truncate text-[13px] text-cocoa-soft" title={b.author}>{b.author}</p>
                    {b.avgRating != null && <div className="mt-1 flex justify-center"><StarDisplay value={b.avgRating} /></div>}
                  </div>
                </li>
              ))}
        </ul>
      </div>

      <div className="mx-4 h-3.5 rounded-lg bg-gradient-to-b from-latte-deep to-caramel-wood shadow-[0_10px_18px_-8px_rgba(59,49,42,.5)] md:mx-6" aria-hidden="true" />

      {!loading && pages > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, k) => (
            <button key={k} type="button" className={'shelf-dot' + (k === i ? ' is-on' : '')} onClick={() => go(k)}
                    aria-label={`ไปหน้าที่ ${k + 1}`} aria-current={k === i ? 'true' : undefined} />
          ))}
        </div>
      )}
      {!loading && books.length === 0 && (
        <p className="px-6 pt-6 text-center text-cocoa-soft">ยังไม่มีหนังสือบนชั้น ลองค้นหาเล่มที่สนใจด้านบน</p>
      )}
    </div>
  );
}

function Chevron({ d }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
}

export default BookShelfCarousel;
