import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RequireRole from './RequireRole';

function Secret() { return <h1>หน้าลับ</h1>; }
function AdminPage() { return <h1>หลังบ้าน</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me/wishlist" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
          <Route path="/admin" element={<RequireRole role="admin"><AdminPage /></RequireRole>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

function loginAs(role) {
  localStorage.setItem('bookreview.token', 'test.token.value');
  localStorage.setItem('bookreview.user', JSON.stringify({ id: 1, name: 'Tester', role }));
}

test('Guest เข้าหน้าสมาชิกไม่ได้ ต้องถูกพาไปหน้า Login', () => {
  renderAt('/me/wishlist');
  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าลับ')).not.toBeInTheDocument();
});

test('Member เข้าหน้าสมาชิกได้', () => {
  loginAs('member');
  renderAt('/me/wishlist');
  expect(screen.getByRole('heading', { name: 'หน้าลับ' })).toBeInTheDocument();
});

test('Guest เข้าหลังบ้าน ต้องถูกพาไปหน้า Login', () => {
  renderAt('/admin');
  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('Member เข้าหลังบ้านไม่ได้ เห็นหน้า 403', () => {
  loginAs('member');
  renderAt('/admin');
  expect(screen.getByText('หน้านี้สำหรับผู้ดูแลระบบเท่านั้น')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'หลังบ้าน' })).not.toBeInTheDocument();
});

test('Admin เข้าหลังบ้านได้', () => {
  loginAs('admin');
  renderAt('/admin');
  expect(screen.getByRole('heading', { name: 'หลังบ้าน' })).toBeInTheDocument();
});
