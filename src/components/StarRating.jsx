// ดาว 5 ดวง: แสดงคะแนน (readOnly) หรือให้เลือกคะแนน (มี onChange) ใช้ radio จึงกดด้วยคีย์บอร์ดได้

function Star({ fill, className }) {
  // fill 0..1 (ครึ่งดวงได้สำหรับคะแนนเฉลี่ย)
  const id = `half-${Math.round(fill * 100)}`;
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="#E8DCCF" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`}
            d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6l-5.2 2.9L6 11.7 1.6 7.7l5.9-.7z" />
    </svg>
  );
}

export function StarDisplay({ value, count, size = 'sm' }) {
  const box = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  if (value == null) {
    return <span className="text-sm text-ink-faint">ยังไม่มีคะแนน</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5" title={`${value} จาก 5 ดาว`}>
      <span className="inline-flex text-gilt">
        {[1, 2, 3, 4, 5].map(n => <Star key={n} fill={Math.max(0, Math.min(1, value - n + 1))} className={box} />)}
      </span>
      <span className={(size === 'lg' ? 'text-lg' : 'text-sm') + ' font-medium text-ink'}>{Number(value).toFixed(1)}</span>
      {count != null && <span className="text-sm text-ink-faint">({count} รีวิว)</span>}
      <span className="sr-only">{value} จาก 5 ดาว</span>
    </span>
  );
}

export function StarInput({ value, onChange, disabled, name = 'rating' }) {
  const labels = ['', 'ไม่ชอบ', 'พอใช้', 'ดี', 'ดีมาก', 'ชอบที่สุด'];
  return (
    <fieldset disabled={disabled} className="flex items-center gap-3">
      <legend className="sr-only">ให้คะแนน 1 ถึง 5 ดาว</legend>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(n => (
          <label key={n} className="cursor-pointer p-0.5">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)}
                   className="peer sr-only" aria-label={`${n} ดาว`} />
            <span className={'block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-cloth ' +
                             (value >= n ? 'text-gilt' : 'text-[#D9C4B0] hover:text-gilt')}>
              <svg viewBox="0 0 20 20" className="h-7 w-7" aria-hidden="true">
                <path fill="currentColor" d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6l-5.2 2.9L6 11.7 1.6 7.7l5.9-.7z" />
              </svg>
            </span>
          </label>
        ))}
      </div>
      <span className="text-sm text-ink-soft">{value ? labels[value] : 'เลือกคะแนน'}</span>
    </fieldset>
  );
}
