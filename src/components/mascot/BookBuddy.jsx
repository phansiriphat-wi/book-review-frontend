import { useEffect, useRef, useState } from 'react';

// "น้องบุ๊ค" ตัวการ์ตูนหนังสือ วาดด้วย SVG ล้วน ไม่ใช้ไลบรารี
//   look        {x, y} ค่า -1..1 ให้ตามองไปทางนั้น (null = ไม่กำหนด)
//   followPointer  ไม่ได้กำหนด look ให้ตามองตามเมาส์
//   mood        'smile' | 'happy' | 'oops' | 'wow'
//   coverEyes   เอามือปิดตา (ตอนพิมพ์รหัสผ่าน)  peekThrough = แง้มนิ้วแอบดู
//   waving      โบกมือ   arms / legs = false ซ่อนแขนขา (ตอนแอบหลังหนังสือ)
const INK = '#3B312A';

function clamp(v) { return Math.max(-1, Math.min(1, v)); }

export default function BookBuddy({
  look = null, followPointer = false, mood = 'smile',
  coverEyes = false, peekThrough = false, waving = false,
  arms = true, legs = true, className = '',
}) {
  const ref = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // ตามองตามเมาส์ (คำนวณจากตำแหน่งตัวการ์ตูนบนจอ)
  useEffect(() => {
    if (!followPointer) return;
    let frame = 0;
    function onMove(e) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
        setPointer({ x: clamp((e.clientX - cx) / (window.innerWidth / 2.5)), y: clamp((e.clientY - cy) / (window.innerHeight / 2.5)) });
      });
    }
    window.addEventListener('pointermove', onMove);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame); };
  }, [followPointer]);

  const eye = look ?? (followPointer ? pointer : { x: 0, y: 0 });
  const px = eye.x * 5, py = eye.y * 5;          // รูม่านตาขยับได้ไม่เกิน 5 หน่วย
  const face = `translate(${eye.x * 2.5}px, ${eye.y * 2}px)`;
  const armUp = peekThrough ? 112 : 128;         // องศาที่ยกแขนขึ้นปิดตา

  return (
    <svg ref={ref} viewBox="0 0 200 212" className={'buddy ' + className}
         aria-hidden="true" focusable="false">
      {legs && (
        <g className="buddy-legs">
          <ellipse cx="100" cy="205" rx="54" ry="6" fill="rgb(0 0 0 / .12)" />
          <path className="buddy-limb" d="M80 180v16M120 180v16" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <ellipse className="buddy-foot" cx="75" cy="199" rx="11" ry="5.5" fill={INK} />
          <ellipse className="buddy-foot" cx="125" cy="199" rx="11" ry="5.5" fill={INK} />
        </g>
      )}

      {/* ที่คั่นหนังสือ */}
      <path className="buddy-ribbon" d="M124 44V10l7 6 7-6v34z" fill="#7FB3C2" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

      {/* ปกหลังกับหน้ากระดาษ */}
      <rect x="46" y="38" width="118" height="146" rx="15" fill="#6E4E37" stroke={INK} strokeWidth="3" />
      <rect x="146" y="44" width="14" height="134" rx="4" fill="#FBF6EC" />
      <path d="M150 54v114M155 54v114" stroke="#E2D3C0" strokeWidth="1.5" />

      {/* ปกหน้า */}
      <clipPath id="buddy-cover"><rect x="34" y="30" width="118" height="150" rx="16" /></clipPath>
      <g clipPath="url(#buddy-cover)">
        <rect x="34" y="30" width="118" height="150" fill="#B98258" />
        <rect x="34" y="30" width="17" height="150" fill="#8A6448" />
        <path d="M51 30v150" stroke="rgb(255 255 255 / .25)" strokeWidth="2" />
        <path d="M64 46h74M64 166h74" stroke="#E6C07E" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="120" cy="52" rx="40" ry="18" fill="rgb(255 255 255 / .12)" />
      </g>
      <rect x="34" y="30" width="118" height="150" rx="16" fill="none" stroke={INK} strokeWidth="3" />

      {/* หน้า */}
      <g className="buddy-face" style={{ transform: face }}>
        <g className={'buddy-brows mood-' + mood}>
          <path d="M70 80q8-6 16 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M108 80q8-6 16 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        {[78, 116].map(cx => (
          <g key={cx} className="buddy-eye">
            <ellipse cx={cx} cy="101" rx="13" ry="15" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
            <g style={{ transform: `translate(${px}px, ${py}px)`, transition: 'transform .18s ease-out' }}>
              <circle cx={cx} cy="102" r={mood === 'wow' ? 5.5 : 7} fill="#2A211B" />
              <circle cx={cx + 2.6} cy="98.5" r="2.4" fill="#FFFFFF" />
            </g>
          </g>
        ))}
        <ellipse cx="65" cy="124" rx="8" ry="5" fill="#F29C8F" opacity=".6" />
        <ellipse cx="129" cy="124" rx="8" ry="5" fill="#F29C8F" opacity=".6" />
        {mood === 'happy' && <path d="M85 122q12 18 24 0z" fill="#7A3328" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />}
        {mood === 'smile' && <path d="M88 124q9 9 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {mood === 'oops' && <path d="M88 130q9-7 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {mood === 'wow' && <ellipse cx="97" cy="128" rx="5.5" ry="7" fill="#7A3328" stroke={INK} strokeWidth="2.5" />}
      </g>

      {arms && (
        <>
          <g className="buddy-arm" style={{ transform: `translate(36px, 128px) rotate(${coverEyes ? -armUp : 24}deg)` }}>
            <path className="buddy-limb" d="M0 0v38" stroke={INK} strokeWidth="5" strokeLinecap="round" />
            <circle cx="0" cy="46" r="11" fill="#F3D9BC" stroke={INK} strokeWidth="2.5" />
          </g>
          <g className={'buddy-arm buddy-arm-r' + (waving && !coverEyes ? ' is-waving' : '')}
             style={{ transform: `translate(158px, 128px) rotate(${coverEyes ? armUp : -24}deg)` }}>
            <path className="buddy-limb" d="M0 0v38" stroke={INK} strokeWidth="5" strokeLinecap="round" />
            <circle cx="0" cy="46" r="11" fill="#F3D9BC" stroke={INK} strokeWidth="2.5" />
          </g>
        </>
      )}
    </svg>
  );
}
