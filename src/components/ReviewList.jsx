import { StarDisplay } from './StarRating';

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// รายการรีวิวของหนังสือ 1 เล่ม รับ items รูปร่างตาม GET /api/books/{id}/reviews
// รีวิวของตัวเองแสดงแยกไว้ที่ส่วนรีวิวของคุณแล้ว จึงไม่ซ้ำในนี้ (excludeUserId)
function ReviewList({ items, excludeUserId }) {
  const shown = items.filter(r => r.userId !== excludeUserId);
  if (shown.length === 0) {
    return <p className="text-sm text-ink-soft">{items.length ? 'ยังไม่มีรีวิวจากสมาชิกคนอื่น' : 'ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเล่มนี้'}</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {shown.map(r => (
        <li key={r.id} className="py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-medium text-ink">{r.user.name}</span>
            <StarDisplay value={r.rating} />
            <span className="text-xs text-ink-faint">
              {dateTH(r.createdAt)}{r.updatedAt !== r.createdAt && ' (แก้ไขแล้ว)'}
            </span>
          </div>
          <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed text-ink-soft">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
