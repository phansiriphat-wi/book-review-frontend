import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookShelfCarousel from './BookShelfCarousel';

const BOOKS = [
  { id: 'OL1W', title: 'Dune', author: 'Frank Herbert', coverUrl: null, avgRating: 4.5 },
  { id: 12, title: 'Admin Book', author: 'Staff', coverUrl: 'https://example.com/c.jpg', avgRating: null },
];
const renderShelf = (props) => render(<MemoryRouter><BookShelfCarousel {...props} /></MemoryRouter>);

test('กำลังโหลด: ชั้นบอกสถานะ busy และยังไม่มีลิงก์หนังสือ', () => {
  renderShelf({ books: [], status: 'loading' });
  expect(screen.getByRole('region', { name: 'ชั้นหนังสือแนะนำ' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});

test('แสดงหนังสือเป็นลิงก์ /books/{id} พร้อมชื่อและผู้แต่ง', () => {
  renderShelf({ books: BOOKS, status: 'success' });
  expect(screen.getByRole('link', { name: 'Dune โดย Frank Herbert' })).toHaveAttribute('href', '/books/OL1W');
  expect(screen.getByRole('link', { name: 'Admin Book โดย Staff' })).toHaveAttribute('href', '/books/12');
  expect(screen.getByRole('button', { name: 'เลื่อนไปทางซ้าย' })).toBeDisabled();
});

test('ชั้นว่าง แสดงข้อความแนะนำ', () => {
  renderShelf({ books: [], status: 'success' });
  expect(screen.getByText(/ยังไม่มีหนังสือบนชั้น/)).toBeInTheDocument();
});
