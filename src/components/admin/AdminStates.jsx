// ชิ้นส่วนเล็ก ๆ ที่ทุกหน้าหลังบ้านใช้ซ้ำ: กล่อง error, ข้อความกำลังโหลด, คลาสปุ่ม, กล่องยืนยัน

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center" role="alert">
      <p className="font-medium text-red-800">โหลดข้อมูลไม่สำเร็จ</p>
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

export function Loading({ text = 'กำลังโหลด...' }) {
  return <p className="py-12 text-center text-ink-faint" aria-busy="true">{text}</p>;
}

export function Notice({ children, tone = 'success' }) {
  const cls = tone === 'success'
    ? 'border-cloth/30 bg-cloth-light text-cloth-dark'
    : 'border-red-200 bg-red-50 text-red-800';
  return <p role="status" className={'rounded-md border px-4 py-3 text-sm ' + cls}>{children}</p>;
}

export const btnPrimary =
  'inline-flex items-center justify-center rounded-md bg-cloth px-4 py-2 text-sm font-medium text-on-accent hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint';
export const btnGhost =
  'inline-flex items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm text-ink hover:border-cloth hover:text-cloth disabled:cursor-not-allowed disabled:opacity-50';
export const btnDanger =
  'inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';
export const inputClass =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-ink placeholder:text-ink-faint focus:border-cloth focus:outline-none focus:ring-2 focus:ring-cloth/20 disabled:bg-paper-shade';
export const labelClass = 'mb-1 block text-sm font-medium text-ink';


export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
        <div className="mt-2 text-sm text-ink-soft">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>
            {busy ? 'กำลังลบ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export const dateTH = (iso) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
