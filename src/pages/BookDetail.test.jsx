import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookDetail from './BookDetail';
import { AuthProvider } from '../auth/AuthContext';
import { getBook, getReviews, getWishlist, postReview, getCategories } from '../api/backend';

jest.mock('../api/backend');

const BOOK = {
  id: 3, openlibraryKey: 'OL9W', title: 'Stored Book', author: 'S. Author', publishedYear: 1980,
  coverUrl: 'https://covers.openlibrary.org/b/id/14543422-L.jpg', description: 'From Supabase.',
  category: 'Fantasy', avgRating: null, reviewCount: 0
};
const NO_REVIEWS = { bookId: 3, items: [], avgRating: null, reviewCount: 0 };

function renderDetail(path = '/books/3') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={<h1>หน้า Login</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  getCategories.mockRejectedValue(new Error('x'));
  getWishlist.mockResolvedValue([]);
});

test('ดึงรายละเอียดจาก Go อย่างเดียว แสดงชื่อ ผู้แต่ง ปี หมวด เรื่องย่อ และรูปปกจาก coverUrl', async () => {
  getBook.mockResolvedValue(BOOK);
  getReviews.mockResolvedValue(NO_REVIEWS);
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'Stored Book' })).toBeInTheDocument();
  expect(getBook).toHaveBeenCalledWith('3');
  expect(screen.getByText('S. Author')).toBeInTheDocument();
  expect(screen.getByText('1980')).toBeInTheDocument();
  expect(screen.getByText('From Supabase.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'แฟนตาซี' })).toHaveAttribute('href', '/books?category=Fantasy');
  expect(screen.getByRole('img', { name: 'ปกหนังสือ Stored Book' }))
    .toHaveAttribute('src', 'https://covers.openlibrary.org/b/id/14543422-L.jpg');
  expect(await screen.findByText('ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเล่มนี้')).toBeInTheDocument();
});

test('ไม่มีรูปปก ใช้ปกสำรอง ไม่ทำหน้าพัง', async () => {
  getBook.mockResolvedValue({ ...BOOK, coverUrl: null });
  getReviews.mockResolvedValue(NO_REVIEWS);
  renderDetail();
  const cover = await screen.findByRole('img', { name: 'ปกหนังสือ Stored Book' });
  expect(cover.tagName).toBe('DIV');
});

test('Guest กดรีวิวถูกพาไปหน้า Login และไม่เห็นฟอร์มรีวิว', async () => {
  const user = userEvent.setup();
  getBook.mockResolvedValue(BOOK);
  getReviews.mockResolvedValue(NO_REVIEWS);
  renderDetail();
  await screen.findByRole('heading', { name: 'Stored Book' });
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบเพื่อรีวิว' }));
  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('Member เขียนรีวิว ส่งไปที่ id ของหนังสือ แล้วโหลดรีวิวใหม่', async () => {
  const user = userEvent.setup();
  localStorage.setItem('bookreview.token', 'tok');
  localStorage.setItem('bookreview.user', JSON.stringify({ id: 7, name: 'Mem', role: 'member' }));
  getBook.mockResolvedValue(BOOK);
  getReviews
    .mockResolvedValueOnce(NO_REVIEWS)
    .mockResolvedValueOnce({
      bookId: 3, avgRating: 4, reviewCount: 1, items: [
        { id: 1, userId: 7, bookId: 3, rating: 4, comment: 'ชอบเล่มนี้มากจริง ๆ', createdAt: '2026-11-11T00:00:00Z', updatedAt: '2026-11-11T00:00:00Z', user: { id: 7, name: 'Mem' } },
      ]
    });
  postReview.mockResolvedValue({ id: 1 });
  renderDetail();

  await user.click(await screen.findByLabelText('4 ดาว'));
  await user.type(screen.getByRole('textbox'), 'ชอบเล่มนี้มากจริง ๆ');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(postReview).toHaveBeenCalledWith('3', { rating: 4, comment: 'ชอบเล่มนี้มากจริง ๆ', category: 'Fantasy' }, 'tok');
  expect(await screen.findByText('รีวิวของคุณ')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'แก้ไข' })).toBeInTheDocument();
});

test('ไม่พบหนังสือ (404) แสดงหน้า Not Found', async () => {
  getBook.mockRejectedValue(Object.assign(new Error('ไม่พบหนังสือเล่มนี้'), { status: 404 }));
  getReviews.mockRejectedValue(new Error('x'));
  renderDetail('/books/999');
  expect(await screen.findByRole('heading', { name: 'ไม่พบหนังสือเล่มนี้' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'กลับไปหน้าหนังสือ' })).toHaveAttribute('href', '/books');
});

test('รหัสในลิงก์ผิดรูปแบบ (400) ก็แสดง Not Found', async () => {
  getBook.mockRejectedValue(Object.assign(new Error('รหัสหนังสือไม่ถูกต้อง'), { status: 400 }));
  getReviews.mockRejectedValue(new Error('x'));
  renderDetail('/books/abc');
  expect(await screen.findByRole('heading', { name: 'ไม่พบหนังสือเล่มนี้' })).toBeInTheDocument();
});

test('backend ล่ม แสดง error พร้อมปุ่มลองใหม่ (ไม่ใช่ Not Found)', async () => {
  const user = userEvent.setup();
  getBook.mockRejectedValueOnce(new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่')).mockResolvedValueOnce(BOOK);
  getReviews.mockResolvedValue(NO_REVIEWS);
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'โหลดข้อมูลหนังสือไม่สำเร็จ' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('heading', { name: 'Stored Book' })).toBeInTheDocument();
  expect(getBook).toHaveBeenCalledTimes(2);
});
