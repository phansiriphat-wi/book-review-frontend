import { useState } from 'react';
import { StarInput } from './StarRating';

const MIN = 10;
const MAX = 2000;

// ฟอร์มรีวิว: ใช้ได้ทั้งเขียนใหม่และแก้ไข (ส่ง initial มา) แม่เป็นคนรู้ว่าจะส่งไปที่ไหนผ่าน onSubmit
// กติกาเดียวกับ Go: ดาว 1–5 และข้อความ 10–2000 ตัวอักษร (Go ตรวจซ้ำอีกชั้น)
function ReviewForm({ bookTitle, initial, submitLabel = 'ส่งรีวิว', onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');      // 'typing' | 'submitting'

  const length = comment.trim().length;
  const ready = rating >= 1 && length >= MIN && length <= MAX;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ready) return;
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (err) {
      setError(err);                                     // ข้อความ 400 / 401 / 409 จาก server
    } finally {
      setStatus('typing');
    }
  }

  const submitting = status === 'submitting';
  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={`รีวิว ${bookTitle}`}>
      <StarInput value={rating} onChange={setRating} disabled={submitting} />
      <div>
        <label htmlFor="review-comment" className="sr-only">ความเห็นต่อหนังสือ</label>
        <textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)}
                  disabled={submitting} rows={4} maxLength={MAX + 50}
                  placeholder={`อ่าน ${bookTitle} แล้วรู้สึกอย่างไร (อย่างน้อย ${MIN} ตัวอักษร)`}
                  className="w-full rounded-md border border-line bg-white px-3 py-2 leading-relaxed text-ink placeholder:text-ink-faint focus:border-cloth focus:outline-none focus:ring-2 focus:ring-cloth/20 disabled:bg-paper-shade" />
        <p className={'mt-1 text-right text-xs ' + (length > MAX ? 'text-red-600' : 'text-ink-faint')}>
          {length}/{MAX}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!ready || submitting}
                className="rounded-md bg-cloth px-5 py-2 text-sm font-medium text-white hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint">
          {submitting ? 'กำลังบันทึก...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting} className="text-sm text-ink-soft hover:text-cloth">
            ยกเลิก
          </button>
        )}
        {!ready && !error && <span className="text-xs text-ink-faint">เลือกดาวและเขียนอย่างน้อย {MIN} ตัวอักษร</span>}
        {error && <p className="text-sm text-red-600" role="alert">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
