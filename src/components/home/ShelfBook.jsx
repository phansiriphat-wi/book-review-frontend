import { useState } from 'react';
import { Link } from 'react-router-dom';

// สีปกสำรอง (เมื่อไม่มีรูปปก) และสีปกหลัง ตาม palette ฟ้า–ครีม–เบจ–แทน
export const COVER_COLORS = [
  { bg: '#BBDCE5', back: '#8FBFCC', fg: '#2E4650' },
  { bg: '#93694B', back: '#74503A', fg: '#FFFFFF' },
  { bg: '#ECEEDF', back: '#C9CCB5', fg: '#3B312A' },
  { bg: '#4E7684', back: '#3A5964', fg: '#FFFFFF' },
  { bg: '#D9C4B0', back: '#B8A089', fg: '#3B312A' },
  { bg: '#6E4E37', back: '#523927', fg: '#FFFFFF' },
  { bg: '#CFAB8D', back: '#A9846A', fg: '#3B312A' },
  { bg: '#A7B89C', back: '#84977A', fg: '#2F3A2A' },
];
// หนังสือจริงสูงไม่เท่ากัน: สัดส่วนสูง/กว้างของแต่ละช่อง
const HEIGHTS = [1.47, 1.56, 1.44, 1.54, 1.49, 1.59, 1.46, 1.52];

// หนังสือ 3 มิติบนชั้น: เอียงให้เห็นสันกระดาษ ชี้หรือโฟกัสแล้วหมุนเข้าหา ลอยขึ้น และแง้มปกหน้า
// ทั้งหมดเป็น CSS ใน index.css (กลุ่ม .sb-*)
function ShelfBook({ book, index = 0, size = 'md', state }) {
  const [broken, setBroken] = useState(false);
  const c = COVER_COLORS[index % COVER_COLORS.length];
  const ratio = size === 'lg' ? 1.48 : HEIGHTS[index % HEIGHTS.length];
  const hasCover = book.coverUrl && !broken;

  return (
    <Link to={`/books/${book.id}`} state={state} aria-label={`${book.title} โดย ${book.author}`}
          className={'sb' + (size === 'lg' ? ' sb-big' : '')}>
      <div className="sb-3d" style={{ height: `calc(var(--w) * ${ratio})` }}>
        <div className="sb-front" style={{ background: c.bg, color: c.fg }}>
          {hasCover ? (
            <img src={book.coverUrl} alt="" loading="lazy" onError={() => setBroken(true)} />
          ) : (
            <>
              <span className="sb-orn" />
              <span className="sb-title">{book.title}</span>
              <span className="sb-author">{book.author}</span>
            </>
          )}
        </div>
        <div className="sb-inner"><span>อ่านรีวิว</span></div>
        <div className="sb-pages" />
        <div className="sb-back" style={{ background: c.back }} />
      </div>
      <span className="sb-floor" aria-hidden="true" />
    </Link>
  );
}

export default ShelfBook;
