import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

afterEach(() => { document.documentElement.classList.remove('dark'); localStorage.clear(); });

test('กดปุ่มสลับโหมด ใส่/เอา class dark ออกจาก <html> และจำค่าไว้', async () => {
  const user = userEvent.setup();
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดมืด' }));
  expect(document.documentElement).toHaveClass('dark');
  expect(localStorage.getItem('bookreview.theme')).toBe('dark');
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดสว่าง' }));
  expect(document.documentElement).not.toHaveClass('dark');
  expect(localStorage.getItem('bookreview.theme')).toBe('light');
});

test('เปิดหน้ามาโดยมี class dark อยู่แล้ว (ตั้งจาก index.html) เริ่มที่โหมดมืด', () => {
  document.documentElement.classList.add('dark');
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  expect(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดสว่าง' })).toBeInTheDocument();
});