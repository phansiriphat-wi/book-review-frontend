import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookGrid from './BookGrid';

const BOOKS = [
  { id: 'OL1W', title: 'Dune', author: 'Frank Herbert', publishedYear: 1965, coverUrl: null, avgRating: 4.5, reviewCount: 2 },
  { id: 12, title: 'Admin Book', author: 'Staff', publishedYear: null, coverUrl: 'https://example.com/c.jpg', avgRating: null },
];

const renderGrid = (props) => render(<MemoryRouter><BookGrid {...props} /></MemoryRouter>);

test('loading แสดงโครงการ์ด ไม่มีลิงก์หนังสือ', () => {
  renderGrid({ status: 'loading', books: [] });
  expect(screen.getByLabelText('กำลังโหลดหนังสือ')).toBeInTheDocument();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});

test('error แสดงข้อความและปุ่มลองใหม่', async () => {
  const onRetry = jest.fn();
  renderGrid({ status: 'error', error: new Error('server ตอบกลับ 503'), onRetry });
  expect(screen.getByRole('alert')).toHaveTextContent('server ตอบกลับ 503');
  await userEvent.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(onRetry).toHaveBeenCalled();
});

test('สำเร็จแต่ว่าง แสดงข้อความว่าง', () => {
  renderGrid({ status: 'success', books: [], empty: 'ยังไม่มีหนังสือ' });
  expect(screen.getByText('ยังไม่มีหนังสือ')).toBeInTheDocument();
});

test('สำเร็จ แสดงการ์ดพร้อมลิงก์ /books/{id} คะแนน และปกสำรองเมื่อไม่มีรูป', () => {
  renderGrid({ status: 'success', books: BOOKS });
  const links = screen.getAllByRole('link');
  expect(links.map(a => a.getAttribute('href'))).toEqual(['/books/OL1W', '/books/12']);
  expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'ปกหนังสือ Dune' }).tagName).toBe('DIV');   // ปกสำรอง
  expect(screen.getByRole('img', { name: 'ปกหนังสือ Admin Book' }).tagName).toBe('IMG');
});
