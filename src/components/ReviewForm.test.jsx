import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

test('ยังไม่เลือกดาวหรือข้อความสั้นไป ปุ่มส่งต้องกดไม่ได้', async () => {
  const user = userEvent.setup();
  render(<ReviewForm bookTitle="Dune" onSubmit={jest.fn()} />);
  const submit = screen.getByRole('button', { name: 'ส่งรีวิว' });
  expect(submit).toBeDisabled();

  await user.type(screen.getByRole('textbox'), 'สนุกมาก ชอบตอนจบ');
  expect(submit).toBeDisabled();                                  // ยังไม่ได้เลือกดาว

  await user.click(screen.getByLabelText('4 ดาว'));
  expect(submit).toBeEnabled();
});

test('เลือกดาวแล้วกดส่ง ต้องเรียก onSubmit ด้วยคะแนนและข้อความที่ตัดช่องว่างแล้ว', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue();
  render(<ReviewForm bookTitle="Dune" onSubmit={onSubmit} />);

  await user.click(screen.getByLabelText('5 ดาว'));
  await user.type(screen.getByRole('textbox'), '   อ่านสนุกมาก วางไม่ลง   ');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(onSubmit).toHaveBeenCalledWith({ rating: 5, comment: 'อ่านสนุกมาก วางไม่ลง' });
});

test('ถ้า onSubmit โยน Error ต้องโชว์ข้อความนั้น และฟอร์มยังอยู่ให้แก้ต่อ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('คุณรีวิวหนังสือเล่มนี้แล้ว แก้ไขรีวิวเดิมแทนได้'));
  render(<ReviewForm bookTitle="Dune" onSubmit={onSubmit} />);

  await user.click(screen.getByLabelText('3 ดาว'));
  await user.type(screen.getByRole('textbox'), 'ข้อความยาวพอแล้ว');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('คุณรีวิวหนังสือเล่มนี้แล้ว');
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeEnabled();
});

test('โหมดแก้ไขต้องเติมค่าเดิม และมีปุ่มยกเลิก', async () => {
  const user = userEvent.setup();
  const onCancel = jest.fn();
  render(<ReviewForm bookTitle="Dune" initial={{ rating: 2, comment: 'รีวิวเดิมของฉัน' }}
                     submitLabel="บันทึกการแก้ไข" onSubmit={jest.fn()} onCancel={onCancel} />);
  expect(screen.getByRole('textbox')).toHaveValue('รีวิวเดิมของฉัน');
  expect(screen.getByLabelText('2 ดาว')).toBeChecked();
  await user.click(screen.getByRole('button', { name: 'ยกเลิก' }));
  expect(onCancel).toHaveBeenCalled();
});
