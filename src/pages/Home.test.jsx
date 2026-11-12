import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home, { pickShelf } from './Home';
import { getCategories, listBooks } from '../api/backend';
import { resetCategoryCache } from '../data/categories';

jest.mock('../api/backend');

const book = (id, extra = {}) => ({ id, title: `Book ${id}`, author: `Author ${id}`, publishedYear: 2000,
  coverUrl: `https://covers.openlibrary.org/b/id/${id}-L.jpg`, avgRating: null, reviewCount: 0, ...extra });

const ALL = Array.from({ length: 20 }, (_, i) => book(i + 1, i % 4 === 0 ? { coverUrl: null } : {}));

const renderHome = () => render(<MemoryRouter><Home /></MemoryRouter>);

beforeEach(() => {
  resetCategoryCache();
  getCategories.mockRejectedValue(new Error('x'));
  // ชั้นหนังสือเรียก listBooks({ pageSize }) ส่วน "คะแนนสูงสุด" เรียก listBooks({ sort: 'rating', ... })
  listBooks.mockImplementation(({ sort } = {}) => Promise.resolve(
    sort === 'rating'
      ? { items: [book(5, { avgRating: 4.5, reviewCount: 2 }), book(6)], total: 2, page: 1, pageSize: 12 }
      : { items: ALL, total: ALL.length, page: 1, pageSize: 48 }
  ));
});

test('pickShelf เอาเล่มที่มีปกก่อน คงลำดับเดิม และใช้เล่มไม่มีปกเติมเมื่อไม่พอ', () => {
  const list = [book(1, { coverUrl: null }), book(2), book(3, { coverUrl: null }), book(4)];
  expect(pickShelf(list, 3).map(b => b.id)).toEqual([2, 4, 1]);
  expect(pickShelf([], 5)).toEqual([]);
});

test('ชั้นหนังสือใช้หนังสือทั้งหมดจาก Go (ไม่จำกัดเฉพาะเล่มที่มีรีวิว)', async () => {
  renderHome();
  const shelf = await screen.findByRole('region', { name: 'ชั้นหนังสือแนะนำ' });
  expect(await within(shelf).findByRole('link', { name: 'Book 8 โดย Author 8' })).toBeInTheDocument();
  expect(listBooks).toHaveBeenCalledWith({ pageSize: 48 });
  // ทุกเล่มยังไม่มีรีวิว (reviewCount 0) ก็แสดงได้: ส่วนหัว 5 เล่มแรกที่มีปก + ชั้น 3 มิติ 10 เล่มถัดไป = 15 เล่ม
  const heroLinks = within(screen.getByLabelText('หนังสือแนะนำ')).getAllByRole('link');
  expect(heroLinks.map(a => a.getAttribute('href'))).toEqual(['/books/2', '/books/3', '/books/4', '/books/6', '/books/7']);
  const shelfLinks = within(shelf).getAllByRole('link');
  expect(shelfLinks).toHaveLength(10);
  // เล่มที่มีปก 15 เล่มพอดี เล่มไม่มีปก (1, 5, 9, ...) จึงไม่ได้ขึ้นชั้น
  expect(shelfLinks.map(a => a.getAttribute('href'))).not.toContain('/books/1');
});

test('ข้อความหน้าแรกไม่อ้างถึงการค้นหลายล้านเล่มจาก Open Library แล้ว', async () => {
  renderHome();
  await screen.findByRole('region', { name: 'ชั้นหนังสือแนะนำ' });
  expect(screen.queryByText(/หลายล้านเล่ม/)).not.toBeInTheDocument();
  expect(screen.getByText(/ค้นหนังสือในคลังของเรา/)).toBeInTheDocument();
});

test('"สมาชิกให้คะแนนสูงสุด" แสดงเฉพาะเล่มที่มีรีวิว และลิงก์ดูทั้งหมดไปหน้า /books', async () => {
  renderHome();
  expect(await screen.findByRole('heading', { name: 'Book 5' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Book 6' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'ดูทั้งหมด' })).toHaveAttribute('href', '/books');
});

test('หมวดหมู่ทุกหมวด (รวม "ทั่วไป") ลิงก์ไปหน้า Books พร้อม category', async () => {
  renderHome();
  await screen.findByRole('region', { name: 'ชั้นหนังสือแนะนำ' });
  expect(screen.getByRole('link', { name: 'สยองขวัญ' })).toHaveAttribute('href', '/books?category=Horror');
  expect(screen.getByRole('link', { name: 'ทั่วไป' })).toHaveAttribute('href', '/books?category=General');
});

test('backend ล่ม ชั้นหนังสือว่างพร้อมข้อความ ไม่ทำหน้าพัง', async () => {
  listBooks.mockRejectedValue(new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้'));
  renderHome();
  expect(await screen.findByText(/ยังไม่มีหนังสือบนชั้น/)).toBeInTheDocument();
  expect(await screen.findByText('โหลดรายการหนังสือไม่สำเร็จ')).toBeInTheDocument();   // ส่วนคะแนนสูงสุดมีปุ่มลองใหม่
});
