// รูปโปรไฟล์จากตัวอักษรแรกของชื่อ (ตาราง users ไม่มีช่องเก็บรูป จึงไม่ต้องอัปโหลดและไม่ต้องแก้ฐานข้อมูล)
// สีเลือกจากเลขผู้ใช้ คนเดิมได้สีเดิมทุกครั้ง
const TONES = [
  { bg: '#B98258', fg: '#FFF8EE' },
  { bg: '#5D8C99', fg: '#F4FAFB' },
  { bg: '#C9965F', fg: '#2A211B' },
  { bg: '#7A8F5C', fg: '#F7F9F1' },
  { bg: '#8A6448', fg: '#FFF8EE' },
];
const THAI_LEADING_VOWEL = /^[เแโใไ]/;

export function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = Array.from(words[0]);
  if (/^[A-Za-z]/.test(first[0])) {
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  // ชื่อไทยที่ขึ้นต้นด้วยสระหน้า เช่น "เมย์" ใช้ "เม" ไม่ใช่ "เ" ตัวเดียว
  return THAI_LEADING_VOWEL.test(first[0]) ? first.slice(0, 2).join('') : first[0];
}

function Avatar({ name, id = 0, className = '' }) {
  const tone = TONES[Math.abs(Number(id) || 0) % TONES.length];
  return (
    <div role="img" aria-label={`รูปโปรไฟล์ของ ${name}`}
         className={'relative grid shrink-0 place-items-center rounded-[28px] font-serif font-semibold shadow-[0_14px_30px_-16px_rgb(var(--shadow)/.7)] ring-4 ring-white ' + className}
         style={{ background: tone.bg, color: tone.fg }}>
      <span aria-hidden="true">{initials(name)}</span>
      {/* ที่คั่นหนังสือเล็ก ๆ มุมขวาบน ให้เข้ากับน้องบุ๊ค */}
      <span aria-hidden="true" className="absolute -top-1 right-5 h-7 w-4 bg-[#7FB3C2] [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" />
    </div>
  );
}

export default Avatar;
