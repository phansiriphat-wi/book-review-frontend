import { inputClass } from './admin/AdminStates';

// ช่องรหัสผ่านพร้อมปุ่มแสดง/ซ่อน (ใช้ทั้งหน้า Login และ Register)
// onFocus/onBlur ของช่องกรอกส่งต่อให้หน้าแม่ ปุ่มแสดงรหัสกดแล้วไม่ทำให้ช่องหลุดโฟกัส
function PasswordInput({ show, onToggle, ...input }) {
  return (
    <div className="relative">
      <input {...input} type={show ? 'text' : 'password'} className={inputClass + ' pr-12'} />
      <button type="button" onClick={onToggle} onMouseDown={(e) => e.preventDefault()}
              aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={show}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-ink-faint hover:text-cloth">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
          {!show && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}

export default PasswordInput;
