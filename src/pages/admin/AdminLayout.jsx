import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  'whitespace-nowrap border-b-2 px-1 pb-3 text-sm ' +
  (isActive ? 'border-cloth font-medium text-ink' : 'border-transparent text-ink-soft hover:text-ink');

function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="font-serif text-2xl font-bold text-ink">หลังบ้าน</h1>
      <nav className="mt-5 flex gap-6 overflow-x-auto border-b border-line" aria-label="เมนูหลังบ้าน">
        <NavLink to="/admin" end className={tabClass}>ภาพรวม</NavLink>
        <NavLink to="/admin/books" className={tabClass}>หนังสือ</NavLink>
        <NavLink to="/admin/reviews" className={tabClass}>รีวิว</NavLink>
        <NavLink to="/admin/users" className={tabClass}>สมาชิก</NavLink>
      </nav>
      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
