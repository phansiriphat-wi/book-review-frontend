import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../auth/AuthContext';

jest.mock('../api/backend');

const renderLogin = () => render(<AuthProvider><MemoryRouter initialEntries={['/login']}><Login /></MemoryRouter></AuthProvider>);

test('น้องบุ๊คพูดตามช่องที่กำลังกรอก และปิดตาตอนพิมพ์รหัสผ่าน', async () => {
  const user = userEvent.setup();
  renderLogin();
  expect(screen.getByText('สวัสดี! กลับมาอ่านต่อกันเถอะ')).toBeInTheDocument();
  await user.click(screen.getByLabelText('อีเมล'));
  expect(screen.getByText('ใส่อีเมลที่สมัครไว้ได้เลย')).toBeInTheDocument();
  await user.click(screen.getByLabelText('รหัสผ่าน'));
  expect(screen.getByText('ไม่แอบดูแน่นอน!')).toBeInTheDocument();
});

test('ปุ่มแสดงรหัสผ่าน สลับชนิดช่อง และน้องบุ๊คแง้มนิ้วแอบดู', async () => {
  const user = userEvent.setup();
  renderLogin();
  const input = screen.getByLabelText('รหัสผ่าน');
  await user.click(input);
  await user.type(input, 'secret123');
  expect(input).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'แสดงรหัสผ่าน' }));
  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveFocus();                                  // กดปุ่มแล้วช่องไม่หลุดโฟกัส
  expect(screen.getByText('แอบดูนิดเดียวนะ')).toBeInTheDocument();
});
