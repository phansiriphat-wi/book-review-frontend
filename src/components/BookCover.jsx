import { useState } from 'react';

// ปกหนังสือ: มีรูปใช้รูป ไม่มีรูปหรือรูปโหลดไม่ขึ้น วาดปกผ้าเรียบ ๆ ที่มีชื่อเรื่องแทน
function BookCover({ src, title, className = '', size = 'md' }) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <img src={src} alt={`ปกหนังสือ ${title}`} loading="lazy" onError={() => setBroken(true)}
           className={'aspect-[2/3] w-full rounded-[3px] bg-paper-shade object-cover shadow-cover ' + className} />
    );
  }
  return (
    <div role="img" aria-label={`ปกหนังสือ ${title}`}
         className={'flex aspect-[2/3] w-full flex-col justify-between rounded-[3px] bg-cloth p-3 text-left shadow-cover ' + className}>
      <span className="h-px w-8 bg-gilt" />
      <span className={'line-clamp-4 font-serif font-semibold leading-snug text-white ' + (size === 'lg' ? 'text-xl' : 'text-sm')}>
        {title}
      </span>
      <span className="h-px w-8 bg-gilt" />
    </div>
  );
}

export default BookCover;
