import { useState } from 'react';
import BookBuddy from './BookBuddy';

// น้องบุ๊คแอบอยู่หลังหนังสือบนชั้น โผล่มาจ๊ะเอ๋เป็นระยะ ชี้หรือแตะแล้วโผล่ค้าง
// วางไว้ใน element ที่ relative และมีหนังสือ (z-10) บังอยู่ด้านหน้า
// เป็นของตกแต่ง (aria-hidden) จึงไม่รับโฟกัสคีย์บอร์ด
function PeekBuddy() {
  const [pop, setPop] = useState(false);
  return (
    <div aria-hidden="true" className={'peek-wrap pointer-events-none absolute inset-0 ' + (pop ? 'is-pop' : '')}>
      <div className={'peek-buddy pointer-events-auto ' + (pop ? 'is-pop' : '')}
           onPointerEnter={() => setPop(true)} onPointerLeave={() => setPop(false)}
           onClick={() => setPop(p => !p)}>
        <span className="peek-bubble rounded-2xl rounded-br-sm border border-latte-deep/60 bg-white px-3 py-1.5 font-round text-sm text-ink shadow-[0_8px_18px_-10px_rgb(0_0_0/.45)] sm:text-base">
          {pop ? 'จ๊ะเอ๋! เจอแล้ว' : 'จ๊ะเอ๋!'}
        </span>
        <BookBuddy arms={false} legs={false} mood={pop ? 'happy' : 'smile'} look={{ x: -0.5, y: 0.35 }} className="w-full" />
      </div>
      {/* มือสองข้างเกาะขอบบนของหนังสือ อยู่หน้าปก */}
      <span className="peek-hands absolute inset-x-[16%] top-0 z-20 flex -translate-y-1/2 justify-between">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3B312A] bg-[#F3D9BC] sm:h-4 sm:w-4" />
        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3B312A] bg-[#F3D9BC] sm:h-4 sm:w-4" />
      </span>
    </div>
  );
}

export default PeekBuddy;
