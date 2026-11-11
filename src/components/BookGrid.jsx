import BookCard from './BookCard';

const GRID = 'grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

// วาดรายการหนังสือตาม "สถานะ" แบบเดียวกับ MovieGrid: loading | error | success (สำเร็จแต่ว่างก็เป็น success)
function BookGrid({ books, status, error, onRetry, empty, category, renderAction }) {
  if (status === 'loading') {
    return (
      <div className={GRID} aria-busy="true" aria-label="กำลังโหลดหนังสือ">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-[3px] bg-paper-shade" />
            <div className="mt-3 h-4 w-4/5 rounded bg-paper-shade" />
            <div className="mt-2 h-3 w-1/2 rounded bg-paper-shade" />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
        <p className="font-medium text-red-800">โหลดรายการหนังสือไม่สำเร็จ</p>
        <p className="mt-1 text-sm text-red-700">{error?.message}</p>
        {onRetry && (
          <button onClick={onRetry}
                  className="mt-4 rounded-md border border-red-300 bg-white px-4 py-2 text-sm text-red-800 hover:bg-red-100">
            ลองใหม่
          </button>
        )}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line px-6 py-14 text-center text-ink-soft">
        {empty ?? 'ไม่พบหนังสือที่ค้นหา ลองใช้คำอื่นหรือเลือกหมวดอื่น'}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {books.map(b => (
        <BookCard key={b.id} book={b} category={category} action={renderAction?.(b)} />
      ))}
    </div>
  );
}

export default BookGrid;
