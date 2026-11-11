import { useState } from 'react';
import clsx from 'clsx';
import { BookOpen } from 'lucide-react';
import { useResponsive } from './use-responsive';

// หนังสือ 3 มิติ: หน้าปก + สันกระดาษด้านข้าง + ปกหลัง หมุนเอียงเมื่อชี้ที่ตัวแม่ที่มี class "group"
// ดัดแปลงจากคอมโพเนนต์ Book (TSX/shadcn) ให้เป็น JS และใช้สีของโปรเจกต์นี้
// - src: รูปปกจริง (ถ้าโหลดไม่ขึ้นจะวาดปกแทน)
// - variant: 'stripe' (แถบสีด้านบน + ชื่อเรื่องด้านล่าง) | 'simple' (สีเต็มปก)
// - width: px, '100%' หรือ { sm, md, lg, xl } — ค่าเริ่มต้นกว้างเต็มช่อง
// - thickness: ความหนาเทียบกับความกว้าง (0.18 = 18%)
// - ratio: สัดส่วนปก กว้าง/สูง ค่าเริ่มต้น 2/3 เท่าปกหนังสือจริง

const DefaultIllustration = <BookOpen aria-hidden="true" strokeWidth={1.5} style={{ width: '22cqw', height: '22cqw' }} />;

export function Book({
  title,
  src,
  variant = 'stripe',
  width = '100%',
  color,
  textColor,
  illustration,
  textured = false,
  thickness = 0.18,
  ratio = '2 / 3',
  size = 'md',
  className,
}) {
  const [broken, setBroken] = useState(false);
  const w = useResponsive(width);
  const cssWidth = typeof w === 'number' ? `${w}px` : w;
  const depth = `${thickness * 100}cqw`;
  const hasImage = src && !broken;

  const bg = color ?? (variant === 'simple' ? '#F6F7EF' : '#8A6448');
  const fg = textColor ?? (variant === 'simple' ? '#3B312A' : '#FFFFFF');
  const art = illustration ?? DefaultIllustration;

  return (
    <div className={clsx('book-3d', className)} style={{ width: cssWidth, perspective: 900, containerType: 'inline-size' }}>
      <div className="book-rotate relative w-full" style={{ aspectRatio: ratio, transformStyle: 'preserve-3d' }}>
        {/* หน้าปก */}
        <div className="relative h-full w-full overflow-hidden rounded-l-[4px] rounded-r-[2px] bg-paper-shade shadow-book after:pointer-events-none after:absolute after:inset-0 after:rounded-l-[4px] after:rounded-r-[2px] after:border after:border-black/[.08] after:shadow-book-border">
          {hasImage ? (
            <img src={src} alt={`ปกหนังสือ ${title}`} loading="lazy" onError={() => setBroken(true)}
                 className="h-full w-full object-cover" />
          ) : (
            <div role="img" aria-label={`ปกหนังสือ ${title}`} className="flex h-full w-full flex-col" style={{ background: variant === 'simple' ? bg : undefined }}>
              {variant === 'stripe' && (
                <div className="relative flex flex-1 items-center justify-center" style={{ background: bg, color: fg }}>
                  {art}
                </div>
              )}
              <div className={clsx('flex flex-col p-[6.1%] pl-[14.3%]', variant === 'stripe' ? 'bg-book-gradient' : 'flex-1 gap-[6cqw]')}
                   style={{ color: variant === 'stripe' ? '#3B312A' : fg }}>
                <span className="line-clamp-4 text-balance font-serif font-semibold leading-[1.25] tracking-[-.01em]"
                      style={{ fontSize: size === 'lg' ? '11cqw' : '10.5cqw' }}>
                  {title}
                </span>
                {variant === 'simple' && <span style={{ color: fg }}>{art}</span>}
              </div>
            </div>
          )}
          {/* เงาสันปก */}
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[8.2%] bg-book-bind mix-blend-overlay" />
          {textured && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-book-texture opacity-60 mix-blend-multiply" />}
        </div>

        {/* สันกระดาษด้านขวา */}
        <div aria-hidden="true" className="absolute top-[3px]"
             style={{
               height: 'calc(100% - 6px)',
               width: `calc(${depth} - 2px)`,
               background: 'linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa)',
               transform: `translateX(calc(100cqw - ${depth} / 2 - 3px)) rotateY(90deg) translateX(calc(${depth} / 2))`,
             }} />
        {/* ปกหลัง */}
        <div aria-hidden="true" className="absolute inset-0 rounded-l-[4px] rounded-r-[2px] bg-line"
             style={{ transform: `translateZ(calc(-1 * ${depth}))` }} />
      </div>
    </div>
  );
}

export default Book;
