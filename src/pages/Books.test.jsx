import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Books from './Books';
import { getBooks, searchBooks } from '../api/openlibrary';
import { getCategories, getRatings, listBooks } from '../api/backend';
import { resetCategoryCache } from '../data/categories';

// แทนทั้งไฟล์ด้วยของปลอม (แนวเดียวกับ Movies.test.jsx) แต่เก็บค่าคงที่ของจริงไว้
jest.mock('../api/openlibrary', () => ({ ...jest.requireActual('../api/openlibrary'), getBooks: jest.fn(), searchBooks: jest.fn() }));
jest.mock('../api/backend');

const OL_PAGE = {
  items: [
    { id: 'OL1W', openlibraryKey: 'OL1W', title: 'Dragon Book', author: 'A. Writer', publishedYear: 2001, coverUrl: null, avgRating: null },
    { id: 'OL2W', openlibraryKey: 'OL2W', title: 'Second Book', author: 'B. Writer', publishedYear: 1999, coverUrl: null, avgRating: null },
  ],
  total: 50, page: 1, pageSize: 24,
};

function Where() {
  const loc = useLocation();
  return <output data-testid="url">{loc.pathname + loc.search}</output>;
}

function renderAt(path = '/books') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/books" element={<><Books /><Where /></>} /></Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  resetCategoryCache();
  getCategories.mockRejectedValue(new Error('backend sleeping'));   // ใช้หมวดสำรอง
  getRatings.mockResolvedValue([]);
});

test('เปิดหน้าครั้งแรก โหลดหมวดแรกจาก Open Library และแสดงการ์ด', async () => {
  getBooks.mockResolvedValue(OL_PAGE);
  renderAt();
  expect(await screen.findByRole('heading', { name: 'Dragon Book' })).toBeInTheDocument();
  expect(getBooks).toHaveBeenCalledWith('fantasy', 1);
  expect(screen.getByText('พบ 50 เล่ม')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'แฟนตาซี' })).toHaveAttribute('aria-pressed', 'true');
});

test('คะแนนเฉลี่ยจากสมาชิกถูกเติมลงการ์ด Open Library', async () => {
  getBooks.mockResolvedValue(OL_PAGE);
  getRatings.mockResolvedValue([{ openlibraryKey: 'OL2W', bookId: 5, avgRating: 4.5, reviewCount: 2 }]);
  renderAt();
  expect(await screen.findByText('4.5')).toBeInTheDocument();
  expect(getRatings).toHaveBeenCalledWith(['OL1W', 'OL2W']);
});

test('เลือกหมวดอื่น เปลี่ยน URL และโหลดหมวดนั้น', async () => {
  const user = userEvent.setup();
  getBooks.mockResolvedValue(OL_PAGE);
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  await user.click(screen.getByRole('button', { name: 'สยองขวัญ' }));
  expect(screen.getByTestId('url')).toHaveTextContent('/books?category=Horror');
  expect(getBooks).toHaveBeenLastCalledWith('horror', 1);
});

test('ค้นหา ใช้ searchBooks และเก็บคำค้นใน URL', async () => {
  const user = userEvent.setup();
  getBooks.mockResolvedValue(OL_PAGE);
  searchBooks.mockResolvedValue({ ...OL_PAGE, items: [OL_PAGE.items[1]], total: 1 });
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  await user.type(screen.getByRole('searchbox', { name: 'ค้นชื่อหนังสือหรือผู้แต่ง' }), 'second');
  await user.click(screen.getByRole('button', { name: 'ค้นหา' }));
  expect(await screen.findByText('ผลค้นหา "second" พบ 1 เล่ม')).toBeInTheDocument();
  expect(searchBooks).toHaveBeenCalledWith('second', 1, null);
  expect(screen.getByTestId('url')).toHaveTextContent('/books?q=second');
});

test('กดหน้าถัดไป โหลดหน้า 2', async () => {
  const user = userEvent.setup();
  getBooks.mockResolvedValue(OL_PAGE);
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  expect(screen.getByText('หน้า 1 จาก 3')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
  expect(getBooks).toHaveBeenLastCalledWith('fantasy', 2);
  expect(screen.getByTestId('url')).toHaveTextContent('page=2');
});

test('แท็บ "มีรีวิวในเว็บนี้" ดึงจาก Go และแสดงข้อความว่างเมื่อยังไม่มีหนังสือ', async () => {
  listBooks.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 24 });
  renderAt('/books?source=library');
  expect(await screen.findByText(/ยังไม่มีหนังสือในระบบ/)).toBeInTheDocument();
  expect(listBooks).toHaveBeenCalledWith({ q: '', category: '', page: 1, pageSize: 24 });
  expect(within(screen.getByLabelText('หมวดหมู่')).getByRole('button', { name: 'ทุกหมวด' })).toHaveAttribute('aria-pressed', 'true');
});

test('Open Library ล่ม แสดง error และลองใหม่ได้', async () => {
  const user = userEvent.setup();
  getBooks.mockRejectedValueOnce(new Error('Open Library ตอบกลับ 503')).mockResolvedValueOnce(OL_PAGE);
  renderAt();
  expect(await screen.findByText('Open Library ตอบกลับ 503')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('heading', { name: 'Dragon Book' })).toBeInTheDocument();
  expect(getBooks).toHaveBeenCalledTimes(2);
});
