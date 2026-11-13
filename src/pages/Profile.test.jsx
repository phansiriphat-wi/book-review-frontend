import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Profile from './Profile';
import { AuthProvider } from '../auth/AuthContext';
import { getMe, getMyReviews, updateProfile, changePassword } from '../api/backend';
import { validatePasswords } from '../components/profile/ChangePasswordForm';
import { initials } from '../components/profile/Avatar';

jest.mock('../api/backend', () => ({
  ...jest.requireActual('../api/backend'),
  getMe: jest.fn(), getMyReviews: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn(),
}));

const ME = { id: 7, name: 'Mali Reader', email: 'mali@example.com', role: 'member',
             createdAt: '2026-01-15T00:00:00Z', reviewCount: 2, wishlistCount: 3 };
const REVIEWS = {
  total: 2, page: 1, pageSize: 5, avgRating: 4.5,
  items: [
    { id: 11, userId: 7, bookId: 3, rating: 5, comment: 'สนุกมาก อ่านจบในคืนเดียว', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
      user: { id: 7, name: 'Mali Reader' }, book: { id: 3, title: 'The Hidden Song', openlibraryKey: null, coverUrl: null } },
    { id: 12, userId: 7, bookId: 4, rating: 4, comment: 'ภาษาสวย แต่ตอนกลางช้าไปนิด', createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-05T00:00:00Z',
      user: { id: 7, name: 'Mali Reader' }, book: { id: 4, title: 'The Copper Map', openlibraryKey: null, coverUrl: null } },
  ],
};

function renderProfile() {
  localStorage.setItem('bookreview.token', 'tok-1');
  localStorage.setItem('bookreview.user', JSON.stringify({ id: 7, name: 'Mali Reader', email: 'mali@example.com', role: 'member' }));
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/me']}>
        <Routes>
          <Route path="/me" element={<Profile />} />
          <Route path="/" element={<h1>หน้าแรก</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  getMe.mockResolvedValue(ME);
  getMyReviews.mockResolvedValue(REVIEWS);
});

test('แสดงชื่อ อีเมล บทบาท และจำนวนรีวิวจาก API จริง (ส่งตั๋วไปด้วย)', async () => {
  renderProfile();
  expect(await screen.findByRole('heading', { name: 'Mali Reader' })).toBeInTheDocument();
  expect(getMe).toHaveBeenCalledWith('tok-1');
  expect(getMyReviews).toHaveBeenCalledWith({ page: 1, pageSize: 5 }, 'tok-1');
  expect(screen.getByText('mali@example.com')).toBeInTheDocument();
  expect(screen.getByText('Member')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'รูปโปรไฟล์ของ Mali Reader' })).toHaveTextContent('MR');
  const stats = screen.getByRole('region', { name: 'กิจกรรมของฉัน' });
  expect(within(stats).getByText('รีวิวทั้งหมด').parentElement).toHaveTextContent('2');
  expect(await within(stats).findByText('4.5')).toBeInTheDocument();
  expect(within(stats).getByRole('link', { name: /รายการอยากอ่าน/ })).toHaveAttribute('href', '/me/wishlist');
  // รีวิวของฉัน ลิงก์ไปหน้าหนังสือ
  expect(await screen.findByRole('link', { name: 'The Hidden Song' })).toHaveAttribute('href', '/books/3');
  expect(screen.getByText('สนุกมาก อ่านจบในคืนเดียว')).toBeInTheDocument();
  expect(screen.getByText(/แก้ไขแล้ว/)).toBeInTheDocument();
});

test('admin เห็นป้าย Admin และลิงก์หลังบ้าน', async () => {
  getMe.mockResolvedValue({ ...ME, role: 'admin' });
  renderProfile();
  expect(await screen.findByText('Admin')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'หลังบ้าน' })).toHaveAttribute('href', '/admin');
});

test('ระหว่างโหลดแสดงสถานะกำลังโหลด', async () => {
  let resolve;
  getMe.mockReturnValue(new Promise(r => { resolve = r; }));
  renderProfile();
  expect(screen.getByText('กำลังโหลดโปรไฟล์...')).toBeInTheDocument();
  resolve(ME);
  expect(await screen.findByRole('heading', { name: 'Mali Reader' })).toBeInTheDocument();
});

test('โหลดโปรไฟล์ไม่สำเร็จ แสดง error และกดลองใหม่ได้', async () => {
  const user = userEvent.setup();
  getMe.mockRejectedValueOnce(new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่'));
  renderProfile();
  expect(await screen.findByText('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('heading', { name: 'Mali Reader' })).toBeInTheDocument();
});

test('403 จาก server แสดงข้อความ error ไม่ทำหน้าพัง', async () => {
  getMe.mockRejectedValueOnce(Object.assign(new Error('ไม่มีสิทธิ์เข้าถึง'), { status: 403 }));
  renderProfile();
  expect(await screen.findByRole('alert')).toHaveTextContent('ไม่มีสิทธิ์เข้าถึง');
});

test('ยังไม่มีรีวิว แสดง empty state พร้อมลิงก์ไปหาหนังสือ', async () => {
  getMe.mockResolvedValue({ ...ME, reviewCount: 0 });
  getMyReviews.mockResolvedValue({ total: 0, page: 1, pageSize: 5, avgRating: null, items: [] });
  renderProfile();
  expect(await screen.findByText('ยังไม่มีรีวิวเลย')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'ไปเลือกหนังสือเล่มแรก' })).toHaveAttribute('href', '/books');
});

test('โหลดรีวิวไม่สำเร็จ แสดง error เฉพาะส่วนรีวิว และลองใหม่ได้', async () => {
  const user = userEvent.setup();
  getMyReviews.mockRejectedValueOnce(new Error('ระบบขัดข้อง ลองใหม่อีกครั้ง'));
  renderProfile();
  expect(await screen.findByText('ระบบขัดข้อง ลองใหม่อีกครั้ง')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Mali Reader' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('link', { name: 'The Hidden Song' })).toBeInTheDocument();
});

test('แก้ไขโปรไฟล์: ฟอร์มมีชื่อเดิม อีเมลแก้ไม่ได้ ตรวจชื่อว่าง แล้วบันทึกและแสดงชื่อใหม่ทันที', async () => {
  const user = userEvent.setup();
  updateProfile.mockResolvedValue({ ...ME, name: 'Mali B.' });
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'แก้ไขโปรไฟล์' }));
  const name = screen.getByLabelText('ชื่อที่แสดง');
  expect(name).toHaveValue('Mali Reader');
  expect(screen.getByLabelText('อีเมล')).toBeDisabled();
  expect(screen.queryByLabelText(/บทบาท|role/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'บันทึก' })).toBeDisabled();       // ยังไม่ได้แก้

  await user.clear(name);
  await user.type(name, '   ');
  await user.click(screen.getByRole('button', { name: 'บันทึก' }));
  expect(screen.getByText('กรุณากรอกชื่อที่แสดง')).toBeInTheDocument();
  expect(updateProfile).not.toHaveBeenCalled();

  await user.clear(name);
  await user.type(name, ' Mali B. ');
  await user.click(screen.getByRole('button', { name: 'บันทึก' }));
  expect(updateProfile).toHaveBeenCalledWith('Mali B.', 'tok-1');
  expect(await screen.findByRole('heading', { name: 'Mali B.' })).toBeInTheDocument();
  expect(screen.getByText('บันทึกชื่อใหม่แล้ว')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('bookreview.user')).name).toBe('Mali B.');   // navbar ใช้ค่านี้
  expect(JSON.parse(localStorage.getItem('bookreview.user')).role).toBe('member');
});

test('แก้ไขโปรไฟล์: server ตอบ error แสดงข้อความและคงฟอร์มไว้', async () => {
  const user = userEvent.setup();
  updateProfile.mockRejectedValue(new Error('ระบบขัดข้อง ลองใหม่อีกครั้ง'));
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'แก้ไขโปรไฟล์' }));
  await user.type(screen.getByLabelText('ชื่อที่แสดง'), 'x');
  await user.click(screen.getByRole('button', { name: 'บันทึก' }));
  expect(await screen.findByText('ระบบขัดข้อง ลองใหม่อีกครั้ง')).toBeInTheDocument();
  expect(screen.getByLabelText('ชื่อที่แสดง')).toHaveValue('Mali Readerx');
});

test('validatePasswords ครบทุกกติกา', () => {
  expect(validatePasswords({ current: '', next: '', confirm: '' })).toEqual({
    current: 'กรุณากรอกรหัสผ่านปัจจุบัน', next: 'กรุณากรอกรหัสผ่านใหม่', confirm: 'กรุณายืนยันรหัสผ่านใหม่' });
  expect(validatePasswords({ current: 'old-pass-1', next: 'short', confirm: 'short' }).next).toMatch(/อย่างน้อย 8/);
  expect(validatePasswords({ current: 'same-pass-1', next: 'same-pass-1', confirm: 'same-pass-1' }).next).toMatch(/ไม่ซ้ำ/);
  expect(validatePasswords({ current: 'old-pass-1', next: 'new-pass-1', confirm: 'new-pass-2' }).confirm).toMatch(/ไม่ตรงกัน/);
  expect(validatePasswords({ current: 'old-pass-1', next: 'ก'.repeat(25), confirm: 'ก'.repeat(25) }).next).toMatch(/ยาวเกินไป/);   // 75 ไบต์
  expect(validatePasswords({ current: 'old-pass-1', next: 'new-pass-1', confirm: 'new-pass-1' })).toEqual({});
});

test('เปลี่ยนรหัสผ่าน: ตรวจในหน้าก่อนส่ง ปุ่มแสดงรหัส และสำเร็จแล้วใช้ตั๋วใบใหม่', async () => {
  const user = userEvent.setup();
  changePassword.mockResolvedValue({ token: 'tok-2', user: { id: 7, name: 'Mali Reader', email: 'mali@example.com', role: 'member' } });
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  const panel = screen.getByRole('region', { name: 'เปลี่ยนรหัสผ่าน' });

  await user.click(within(panel).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  expect(within(panel).getByText('กรุณากรอกรหัสผ่านปัจจุบัน')).toBeInTheDocument();
  expect(changePassword).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText('รหัสผ่านปัจจุบัน'), 'old-pass-1');
  await user.type(screen.getByLabelText('รหัสผ่านใหม่'), 'new-pass-12');
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'new-pass-13');
  await user.click(within(panel).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  expect(within(panel).getByText('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน')).toBeInTheDocument();

  const newInput = screen.getByLabelText('รหัสผ่านใหม่');
  expect(newInput).toHaveAttribute('type', 'password');
  await user.click(within(panel).getAllByRole('button', { name: 'แสดงรหัสผ่าน' })[1]);
  expect(newInput).toHaveAttribute('type', 'text');

  await user.clear(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'));
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'new-pass-12');
  await user.click(within(panel).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  expect(changePassword).toHaveBeenCalledWith('old-pass-1', 'new-pass-12', 'tok-1');
  expect(await screen.findByText(/เปลี่ยนรหัสผ่านเรียบร้อย/)).toBeInTheDocument();
  expect(screen.queryByLabelText('รหัสผ่านปัจจุบัน')).not.toBeInTheDocument();
  expect(localStorage.getItem('bookreview.token')).toBe('tok-2');
});

test('เปลี่ยนรหัสผ่าน: รหัสปัจจุบันผิด แสดงใต้ช่องนั้น และยังอยู่ในระบบ', async () => {
  const user = userEvent.setup();
  changePassword.mockRejectedValue(Object.assign(new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง'), { status: 400, code: 'WRONG_PASSWORD' }));
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  await user.type(screen.getByLabelText('รหัสผ่านปัจจุบัน'), 'wrong-pass-1');
  await user.type(screen.getByLabelText('รหัสผ่านใหม่'), 'new-pass-12');
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'new-pass-12');
  await user.click(within(screen.getByRole('region', { name: 'เปลี่ยนรหัสผ่าน' })).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
  expect(await screen.findByText('รหัสผ่านปัจจุบันไม่ถูกต้อง')).toBeInTheDocument();
  expect(screen.getByLabelText('รหัสผ่านปัจจุบัน')).toHaveAttribute('aria-invalid', 'true');
  expect(localStorage.getItem('bookreview.token')).toBe('tok-1');
});

test('ออกจากระบบ ล้างตั๋วแล้วกลับหน้าแรก', async () => {
  const user = userEvent.setup();
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'ออกจากระบบ' }));
  expect(screen.getByRole('heading', { name: 'หน้าแรก' })).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('bookreview.token')).toBeNull());
});

test('initials: ชื่ออังกฤษใช้อักษรแรก 2 คำ ชื่อไทยที่ขึ้นต้นด้วยสระหน้าใช้ 2 ตัว', () => {
  expect(initials('mali reader')).toBe('MR');
  expect(initials('มะลิ')).toBe('ม');
  expect(initials('เมย์ ใจดี')).toBe('เม');
  expect(initials('  ')).toBe('?');
});
