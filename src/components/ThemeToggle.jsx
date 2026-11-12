import { useTheme } from '../theme/ThemeContext';

// ปุ่มสลับโหมด: ดวงอาทิตย์หมุนหายแล้วพระจันทร์หมุนเข้ามา (และกลับกัน)
function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggleTheme}
            aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'} title={dark ? 'โหมดสว่าง' : 'โหมดมืด'}
            className={'theme-toggle relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-latte/80 bg-white/70 text-cloth hover:border-cloth ' + className}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
           className={'theme-icon absolute ' + (dark ? 'is-off' : '')}>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
           className={'theme-icon absolute ' + (dark ? '' : 'is-off')}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        <path d="M17 3.5v2.5M15.75 4.75h2.5" />
      </svg>
    </button>
  );
}

export default ThemeToggle;
