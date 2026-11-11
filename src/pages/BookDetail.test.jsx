import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookDetail from './BookDetail';
import { AuthProvider } from '../auth/AuthContext';
import { getBook as getOpenLibraryBook } from '../api/openlibrary';
import { getBook, getReviews, getWishlist, postReview, getCategories } from '../api/backend';

jest.mock('../api/openlibrary', () => ({ ...jest.requireActual('../api/openlibrary'), getBook: jest.fn() }));
jest.mock('../api/backend');

const OL_BOOK = { id: 'OL9W', openlibraryKey: 'OL9W', title: 'Open Book', author: 'O. Author', publishedYear: 1980,
                  coverUrl: null, description: 'From Open Library.', category: null };
const EMPTY_REVIEWS = { bookId: null, items: [], avgRating: null, reviewCount: 0 };

function renderDetail(path = '/books/OL9W') {
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

test('หนังสือ Open Library ที่ยังไม่มีในระบบ (bookId = null) อ่านจาก Open Library โดยไม่ยิง GET /api/books', async () => {
  getOpenLibraryBook.mockResolvedValue(OL_BOOK);
  getReviews.mockResolvedValue(EMPTY_REVIEWS);
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'Open Book' })).toBeInTheDocument();
  expect(screen.getByText('From Open Library.')).toBeInTheDocument();
  expect(getOpenLibraryBook).toHaveBeenCalledWith('OL9W');
  expect(getBook).not.toHaveBeenCalled();                         // ไม่มี 404 ใน console
  expect(await screen.findByText('ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเล่มนี้')).toBeInTheDocument();
});

test('หนังสือ Open Library ที่มีในระบบแล้ว ใช้ข้อมูลจากระบบ (มีหมวดและข้อมูลที่ admin แก้)', async () => {
  getReviews.mockResolvedValue({ ...EMPTY_REVIEWS, bookId: 4 });
  getBook.mockResolvedValue({ ...OL_BOOK, id: 4, title: 'Edited By Admin', category: 'Mystery' });
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'Edited By Admin' })).toBeInTheDocument();
  expect(getBook).toHaveBeenCalledWith(4);
  expect(getOpenLibraryBook).not.toHaveBeenCalled();
});

test('backend ล่ม หนังสือ Open Library ยังเปิดดูได้', async () => {
  getReviews.mockRejectedValue(new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้'));
  getOpenLibraryBook.mockResolvedValue(OL_BOOK);
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'Open Book' })).toBeInTheDocument();
});

test('Guest กดรีวิวหรือ wishlist ถูกพาไปหน้า Login', async () => {
  const user = userEvent.setup();
  getBook.mockResolvedValue({ ...OL_BOOK, id: 3, category: 'Fantasy' });
  getReviews.mockResolvedValue({ bookId: 3, items: [], avgRating: null, reviewCount: 0 });
  renderDetail('/books/3');
  await screen.findByRole('heading', { name: 'Open Book' });
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();     // Guest ไม่เห็นฟอร์มรีวิว
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบเพื่อรีวิว' }));
  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('Member เขียนรีวิว ส่งไปที่ ref เดิมพร้อมหมวด แล้วโหลดรีวิวใหม่', async () => {
  const user = userEvent.setup();
  localStorage.setItem('bookreview.token', 'tok');
  localStorage.setItem('bookreview.user', JSON.stringify({ id: 7, name: 'Mem', role: 'member' }));
  getBook.mockResolvedValue({ ...OL_BOOK, id: 3, category: 'Fantasy' });
  getReviews
    .mockResolvedValueOnce({ bookId: 3, items: [], avgRating: null, reviewCount: 0 })
    .mockResolvedValueOnce({ bookId: 3, avgRating: 4, reviewCount: 1, items: [
      { id: 1, userId: 7, bookId: 3, rating: 4, comment: 'ชอบเล่มนี้มากจริง ๆ', createdAt: '2026-11-11T00:00:00Z', updatedAt: '2026-11-11T00:00:00Z', user: { id: 7, name: 'Mem' } },
    ] });
  postReview.mockResolvedValue({ id: 1 });
  renderDetail('/books/3');

  await user.click(await screen.findByLabelText('4 ดาว'));
  await user.type(screen.getByRole('textbox'), 'ชอบเล่มนี้มากจริง ๆ');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(postReview).toHaveBeenCalledWith('3', { rating: 4, comment: 'ชอบเล่มนี้มากจริง ๆ', category: 'Fantasy' }, 'tok');
  expect(await screen.findByText('รีวิวของคุณ')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'แก้ไข' })).toBeInTheDocument();
});

test('เลขในระบบที่ไม่มีจริง แสดงหน้าไม่พบหนังสือ (ไม่ไปถาม Open Library)', async () => {
  getBook.mockRejectedValue(Object.assign(new Error('ไม่พบหนังสือเล่มนี้'), { status: 404 }));
  getReviews.mockRejectedValue(new Error('x'));
  renderDetail('/books/999');
  expect(await screen.findByRole('heading', { name: 'ไม่พบหนังสือเล่มนี้' })).toBeInTheDocument();
  expect(getOpenLibraryBook).not.toHaveBeenCalled();
});
