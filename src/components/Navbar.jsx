import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ThemeToggle from './ThemeToggle';

// ลิงก์เมนูทรงเม็ดยา: หน้าที่เปิดอยู่เป็นเม็ดสีโกโก้เข้ม ตัวอักษรครีม
const linkClass = ({ isActive }) =>
  'rounded-xl px-3 py-2 text-[15px] transition-colors ' +
  (isActive
    ? 'bg-cocoa font-semibold text-cream shadow-[0_6px_14px_-6px_rgba(59,49,42,.7)]'
    : 'text-ink-soft hover:bg-latte/30 hover:text-cloth-dark');

function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();   // รู้สถานะ login โดยไม่ต้องรับ props จากใคร
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);                   // เมนูบนมือถือ

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books');
    setOpen(false);
  }

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>หน้าแรก</NavLink>
      <NavLink to="/books" className={linkClass} onClick={() => setOpen(false)}>หนังสือ</NavLink>
      {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass} onClick={() => setOpen(false)}>อยากอ่าน</NavLink>}
      {isAdmin && <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>หลังบ้าน</NavLink>}
    </>
  );

  const account = isLoggedIn ? (
    <>
      <NavLink to="/me" className={linkClass} onClick={() => setOpen(false)}>{user?.name}</NavLink>
      <button onClick={handleLogout} className="rounded-xl px-3 py-2 text-[15px] text-ink-soft hover:bg-latte/30 hover:text-cloth-dark">ออกจากระบบ</button>
    </>
  ) : (
    <>
      <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-[15px] text-ink-soft hover:bg-latte/30 hover:text-cloth-dark">เข้าสู่ระบบ</Link>
      <Link to="/register" onClick={() => setOpen(false)}
            className="lift inline-flex min-h-11 items-center rounded-xl bg-cloth px-4 text-[15px] font-semibold text-on-accent shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-cloth-dark">
        สมัครสมาชิก
      </Link>
    </>
  );

  return (
    // แถบเมนูกระจกลอย ติดด้านบนเวลาเลื่อน
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="glass mx-auto max-w-6xl rounded-[20px]">
        <nav className="flex items-center gap-4 py-2.5 pl-5 pr-3 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-serif text-xl font-medium text-ink">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round" className="text-cloth" aria-hidden="true">
              <path d="M2 5.5c3-1 6.5-1 10 1.5 3.5-2.5 7-2.5 10-1.5v13c-3-1-6.5-1-10 1.5-3.5-2.5-7-2.5-10-1.5z" /><path d="M12 7v13" />
            </svg>
            Book Review
          </Link>
          <div className="hidden items-center gap-1 md:flex">{links}</div>

          <form onSubmit={handleSearch} role="search" className="ml-auto hidden flex-1 md:block md:max-w-xs">
            <label htmlFor="nav-search" className="sr-only">ค้นหาหนังสือ</label>
            <input id="nav-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                   className="min-h-10 w-full rounded-xl border border-latte/80 bg-white/70 px-3.5 text-sm placeholder:text-ink-faint focus:border-cloth/50 focus:bg-white/80 focus:outline-none" />
          </form>
          <ThemeToggle className="hidden md:grid" />
          <div className="hidden items-center gap-1 md:flex">{account}</div>

          <ThemeToggle className="ml-auto h-11 w-11 md:hidden" />
          <button className="min-h-11 rounded-xl border border-latte/80 bg-white/70 px-4 text-sm font-medium md:hidden"
                  aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(o => !o)}>
            {open ? 'ปิดเมนู' : 'เมนู'}
          </button>
        </nav>

        {open && (
          <div id="mobile-menu" className="border-t border-latte/60 px-4 pb-4 md:hidden">
            <form onSubmit={handleSearch} role="search" className="pt-3">
              <label htmlFor="nav-search-mobile" className="sr-only">ค้นหาหนังสือ</label>
              <input id="nav-search-mobile" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                     className="min-h-11 w-full rounded-xl border border-latte/80 bg-white/80 px-3.5 text-sm focus:border-cloth/50 focus:bg-white/90 focus:outline-none" />
            </form>
            <div className="mt-3 flex flex-col gap-1">{links}</div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-latte/60 pt-4">{account}</div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
