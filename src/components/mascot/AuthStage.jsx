import BookBuddy from './BookBuddy';

// เวทีของน้องบุ๊คในหน้า Login / Register: กล่องคำพูด + ตัวการ์ตูนลอยขึ้นลง + ดาวและหนังสือเล่มเล็กลอยไปมา
// เป็นของตกแต่ง ข้อความสำคัญ (error) ยังแสดงในฟอร์มตามเดิม
const Star = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={'drift ' + className} style={style}>
    <path d="M12 2.5l2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 16.4l-5.6 3.3 1.4-6.3L3 9.1l6.4-.6z" fill="currentColor" />
  </svg>
);
const MiniBook = ({ className, style, color }) => (
  <svg viewBox="0 0 32 26" className={'drift ' + className} style={style}>
    <path d="M2 4c5-2 9-2 14 1 5-3 9-3 14-1v19c-5-2-9-2-14 1-5-3-9-3-14-1z" fill={color} stroke="#3B312A" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M16 5v19" stroke="#3B312A" strokeWidth="1.6" />
  </svg>
);

function AuthStage({ bubble, ...buddy }) {
  return (
    <div aria-hidden="true"
         className="relative flex items-center gap-4 overflow-hidden rounded-[28px] border border-latte-deep/50 bg-cloth-light/80 px-5 py-4 shadow-[0_18px_40px_-24px_rgb(var(--shadow)/.6)] md:block md:rounded-[32px] md:px-6 md:pb-10 md:pt-10 md:text-center">
      <Star className="left-[8%] top-[14%] w-5 text-gilt" style={{ '--t': '6s', '--r': '-10deg' }} />
      <Star className="right-[12%] top-[10%] w-7 text-gilt" style={{ '--t': '8s', '--d': '-2s', '--x': '-8px' }} />
      <Star className="bottom-[22%] right-[8%] w-4 text-sky-deep" style={{ '--t': '5s', '--d': '-1s' }} />
      <MiniBook className="left-[10%] bottom-[18%] w-9" color="#7FB3C2" style={{ '--t': '9s', '--r': '-14deg', '--y': '-18px' }} />
      <MiniBook className="right-[18%] top-[38%] w-7" color="#E6C07E" style={{ '--t': '7s', '--d': '-3s', '--r': '10deg' }} />

      {/* มือถือ: ตัวการ์ตูนซ้าย กล่องคำพูดขวา (เตี้ย ไม่ดันฟอร์มลงไป) / จอใหญ่: กล่องคำพูดอยู่บนหัว */}
      <p className="relative order-2 inline-block max-w-[16rem] rounded-2xl border border-latte-deep/50 bg-white px-4 py-2 font-round text-sm leading-snug text-ink shadow-sm md:order-none md:mx-auto md:text-base">
        {bubble}
        <span className="absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-latte-deep/50 bg-white md:hidden" />
        <span className="absolute -bottom-[7px] left-1/2 hidden h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-latte-deep/50 bg-white md:block" />
      </p>
      <BookBuddy {...buddy} className="bob relative w-24 shrink-0 md:mx-auto md:mt-4 md:w-56" />
    </div>
  );
}

export default AuthStage;
