import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  'text-sm transition ' + (isActive ? 'font-medium text-cloth' : 'text-ink-soft hover:text-cloth');

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
      <button onClick={handleLogout} className="text-sm text-ink-soft hover:text-cloth">ออกจากระบบ</button>
    </>
  ) : (
    <>
      <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-ink-soft hover:text-cloth">เข้าสู่ระบบ</Link>
      <Link to="/register" onClick={() => setOpen(false)}
            className="rounded-md bg-cloth px-3 py-1.5 text-sm font-medium text-white hover:bg-cloth-dark">
        สมัครสมาชิก
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 md:px-6">
        <Link to="/" className="shrink-0 font-serif text-xl font-bold tracking-tight text-ink">
          Book Review
        </Link>
        <div className="hidden items-center gap-5 md:flex">{links}</div>

        <form onSubmit={handleSearch} role="search" className="ml-auto hidden flex-1 md:block md:max-w-xs">
          <label htmlFor="nav-search" className="sr-only">ค้นหาหนังสือ</label>
          <input id="nav-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                 className="w-full rounded-md border border-line bg-paper-shade px-3 py-1.5 text-sm placeholder:text-ink-faint focus:border-cloth focus:bg-white focus:outline-none" />
        </form>
        <div className="hidden items-center gap-4 md:flex">{account}</div>

        <button className="ml-auto rounded-md border border-line px-3 py-1.5 text-sm md:hidden"
                aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(o => !o)}>
          {open ? 'ปิดเมนู' : 'เมนู'}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line px-4 pb-4 md:hidden">
          <form onSubmit={handleSearch} role="search" className="pt-3">
            <label htmlFor="nav-search-mobile" className="sr-only">ค้นหาหนังสือ</label>
            <input id="nav-search-mobile" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                   className="w-full rounded-md border border-line bg-paper-shade px-3 py-2 text-sm focus:border-cloth focus:bg-white focus:outline-none" />
          </form>
          <div className="mt-3 flex flex-col gap-3">{links}</div>
          <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">{account}</div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
