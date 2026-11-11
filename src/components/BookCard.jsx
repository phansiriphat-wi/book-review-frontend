import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import { StarDisplay } from './StarRating';

// การ์ดหนังสือ 1 เล่ม รับ object รูปร่างเดียวกันทั้งจาก Go และ openlibrary.js:
// { id, title, author, publishedYear, coverUrl, avgRating, reviewCount }
// category = หมวดที่ผู้ใช้เปิดดูอยู่ ส่งต่อให้หน้า BookDetail ใช้ตอนรีวิวหนังสือจาก Open Library
function BookCard({ book, category, action }) {
  return (
    <div className="group flex flex-col">
      <Link to={`/books/${book.id}`} state={{ category, publishedYear: book.publishedYear }} className="block rounded-[3px]">
        <BookCover src={book.coverUrl} title={book.title}
                   className="transition-transform duration-200 group-hover:-translate-y-1" />
        <h3 className="mt-3 line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-ink group-hover:text-cloth"
            title={book.title}>
          {book.title}
        </h3>
      </Link>
      <p className="mt-0.5 truncate text-sm text-ink-soft" title={book.author}>{book.author}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
        {book.publishedYear && <span>พิมพ์ปี {book.publishedYear}</span>}
        {book.avgRating != null && <StarDisplay value={book.avgRating} />}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default BookCard;
