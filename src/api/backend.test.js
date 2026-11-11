import { apiFetch, login, postReview, addToWishlist, listBooks, UNAUTHORIZED_EVENT } from './backend';

// ตัวช่วยสร้าง "คำตอบปลอม" ของ fetch (แนวเดียวกับ backend.test.js ของ MovieHub)
function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));
  const data = await apiFetch('/api/books');
  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/books');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('postReview ใช้รหัส Open Library ใน path แนบ Bearer token และส่ง rating + comment', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));
  await postReview('OL27448W', { rating: 5, comment: 'อ่านสนุกมาก วางไม่ลง', category: 'Fantasy' }, 'abc123');
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/books/OL27448W/reviews');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(JSON.parse(options.body)).toEqual({ rating: 5, comment: 'อ่านสนุกมาก วางไม่ลง', category: 'Fantasy' });
});

test('addToWishlist ส่ง bookId เป็นข้อความเสมอ (เลขในระบบหรือรหัส Open Library)', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 3 }));
  await addToWishlist(15, 't');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ bookId: '15' });
});

test('listBooks ประกอบ query string และข้ามค่าว่าง', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [], total: 0 }));
  await listBooks({ q: 'dune ภาษาไทย', category: '', page: 2, pageSize: 24 });
  expect(fetch.mock.calls[0][0]).toBe('/api/books?q=dune+%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2&page=2&pageSize=24');
});

test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();
  fetch.mockResolvedValue(res);
  expect(await apiFetch('/api/wishlist/1', { method: 'DELETE', token: 'abc' })).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('error ของ Go ({ error: { code, message } }) กลายเป็น Error ที่มีข้อความ status และ code', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: { code: 'BAD_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } }));
  const err = await login('a@b.c', 'wrong').catch(e => e);
  expect(err.message).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  expect(err.status).toBe(401);
  expect(err.code).toBe('BAD_CREDENTIALS');
});

test('401 ตอนแนบ token ต้องส่งสัญญาณให้ออกจากระบบ (ตั๋วหมดอายุ) แต่ login ผิดไม่ส่ง', async () => {
  const listener = jest.fn();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  fetch.mockResolvedValue(fakeResponse(401, { error: { code: 'BAD_TOKEN', message: 'ตั๋วหมดอายุ' } }));

  await login('a@b.c', 'wrong').catch(() => {});
  expect(listener).not.toHaveBeenCalled();

  await apiFetch('/api/wishlist', { token: 'expired' }).catch(() => {});
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener(UNAUTHORIZED_EVENT, listener);
});

test('server ไม่ได้ตอบ JSON หรือเน็ตหลุด ต้องได้ข้อความที่เข้าใจได้', async () => {
  fetch.mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });
  await expect(apiFetch('/api/books')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');

  fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(apiFetch('/api/books')).rejects.toThrow('ติดต่อเซิร์ฟเวอร์ไม่ได้');
});
