import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Books from './Books';
import { getCategories, listBooks } from '../api/backend';
import { resetCategoryCache } from '../data/categories';


jest.mock('../api/backend');

const PAGE = {
  items: [
    {
      id: 1, openlibraryKey: 'OL1W', title: 'Dragon Book', author: 'A. Writer', publishedYear: 2001, category: 'Fantasy',
      coverUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg', avgRating: 4.5, reviewCount: 2
    },
    {
      id: 2, openlibraryKey: null, title: 'No Review Yet', author: 'B. Writer', publishedYear: null, category: 'History',
      coverUrl: null, avgRating: null, reviewCount: 0
    },
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
});

test('เปิดหน้า: ดึงหนังสือทั้งหมดจาก Go (ทุกหมวด หน้า 1) แสดงทุกเล่มรวมเล่มที่ยังไม่มีรีวิว และจำนวนจาก backend', async () => {
  listBooks.mockResolvedValue(PAGE);
  renderAt();
  expect(await screen.findByRole('heading', { name: 'Dragon Book' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'No Review Yet' })).toBeInTheDocument();
  expect(listBooks).toHaveBeenCalledWith({ q: '', category: '', page: 1, pageSize: 24 });
  expect(screen.getByText('พบ 50 เล่ม')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();                 // คะแนนเฉลี่ยมากับข้อมูลหนังสือเลย
  expect(within(screen.getByLabelText('หมวดหมู่')).getByRole('button', { name: 'ทุกหมวด' })).toHaveAttribute('aria-pressed', 'true');
});

test('ไม่มีแท็บแหล่งข้อมูล "จาก Open Library" / "มีรีวิวในเว็บนี้" แล้ว', async () => {
  listBooks.mockResolvedValue(PAGE);
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  expect(screen.queryByText('จาก Open Library')).not.toBeInTheDocument();
  expect(screen.queryByText('มีรีวิวในเว็บนี้')).not.toBeInTheDocument();
});

test('เลือกหมวด ส่ง category เป็นชื่ออังกฤษให้ Go และเก็บใน URL', async () => {
  const user = userEvent.setup();
  listBooks.mockResolvedValue(PAGE);
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  await user.click(screen.getByRole('button', { name: 'สยองขวัญ' }));
  expect(screen.getByTestId('url')).toHaveTextContent('/books?category=Horror');
  expect(listBooks).toHaveBeenLastCalledWith({ q: '', category: 'Horror', page: 1, pageSize: 24 });
  expect(screen.getByRole('button', { name: 'ทั่วไป' })).toBeInTheDocument();   // หมวด General ก็กรองได้
});

test('ค้นหา ส่ง q ให้ Go (ค้นชื่อหรือผู้แต่ง) ภายในหมวดที่เลือกอยู่ และเก็บคำค้นใน URL', async () => {
  const user = userEvent.setup();
  listBooks.mockResolvedValue(PAGE);
  renderAt('/books?category=Fantasy');
  await screen.findByRole('heading', { name: 'Dragon Book' });
  listBooks.mockResolvedValue({ ...PAGE, items: [PAGE.items[0]], total: 1 });
  await user.type(screen.getByRole('searchbox', { name: 'ค้นชื่อหนังสือหรือผู้แต่ง' }), 'A. Writer');
  await user.click(screen.getByRole('button', { name: 'ค้นหา' }));
  expect(await screen.findByText('ผลค้นหา "A. Writer" พบ 1 เล่ม')).toBeInTheDocument();
  expect(listBooks).toHaveBeenLastCalledWith({ q: 'A. Writer', category: 'Fantasy', page: 1, pageSize: 24 });
  expect(screen.getByTestId('url')).toHaveTextContent('/books?category=Fantasy&q=A.+Writer');
});

test('แบ่งหน้า: total 50 หน้าละ 24 = 3 หน้า กดถัดไปขอหน้า 2', async () => {
  const user = userEvent.setup();
  listBooks.mockResolvedValue(PAGE);
  renderAt();
  await screen.findByRole('heading', { name: 'Dragon Book' });
  expect(screen.getByText('หน้า 1 จาก 3')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
  expect(listBooks).toHaveBeenLastCalledWith({ q: '', category: '', page: 2, pageSize: 24 });
  expect(screen.getByTestId('url')).toHaveTextContent('page=2');
});

test('ลิงก์เก่าที่มี ?source=ol / ?source=library ยังเปิดได้ และแสดงหนังสือจาก Go', async () => {
  listBooks.mockResolvedValue(PAGE);
  renderAt('/books?source=library&category=History');
  expect(await screen.findByRole('heading', { name: 'Dragon Book' })).toBeInTheDocument();
  expect(listBooks).toHaveBeenCalledWith({ q: '', category: 'History', page: 1, pageSize: 24 });
});

test('ไม่มีหนังสือเลย และค้นไม่เจอ แสดงข้อความว่างต่างกัน', async () => {
  listBooks.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 24 });
  const { unmount } = renderAt();
  expect(await screen.findByText('ยังไม่มีหนังสือในระบบ')).toBeInTheDocument();
  unmount();
  renderAt('/books?q=zzz');
  expect(await screen.findByText('ไม่พบหนังสือที่ค้นหา ลองใช้คำอื่นหรือเลือกหมวดอื่น')).toBeInTheDocument();
});

test('backend ล่ม แสดง error และกดลองใหม่ได้', async () => {
  const user = userEvent.setup();
  listBooks.mockRejectedValueOnce(new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่')).mockResolvedValueOnce(PAGE);
  renderAt();
  expect(await screen.findByText('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('heading', { name: 'Dragon Book' })).toBeInTheDocument();
  expect(listBooks).toHaveBeenCalledTimes(2);
});
