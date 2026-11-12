import { validate, isHttpsUrl } from './AdminBookForm';

const ok = { title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', description: '',
             coverUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg', publishedYear: '1965', openlibraryKey: 'OL893415W' };


test('ข้อมูลครบ ไม่มี error', () => {
  expect(validate(ok)).toEqual({});
  expect(validate({ ...ok, coverUrl: '', publishedYear: '', openlibraryKey: '' })).toEqual({});
});

test.each([
  ['title', { title: '   ' }],
  ['author', { author: '' }],
  ['category', { category: '' }],
  ['coverUrl', { coverUrl: 'http://insecure.example.com/a.jpg' }],
  ['publishedYear', { publishedYear: String(new Date().getFullYear() + 2) }],
  ['publishedYear', { publishedYear: 'abc' }],
  ['openlibraryKey', { openlibraryKey: 'OL1M' }],
  ['description', { description: 'ก'.repeat(5001) }],
])('ช่อง %s ผิดต้องมี error', (field, change) => {
  expect(validate({ ...ok, ...change })).toHaveProperty(field);
});

test('isHttpsUrl ใช้กติกาเดียวกับ Go: https + มี host (localhost และพอร์ตก็ได้)', () => {
  expect(isHttpsUrl('https://covers.openlibrary.org/b/id/1-L.jpg')).toBe(true);
  expect(isHttpsUrl('https://localhost:18443/b/id/1-L.jpg')).toBe(true);
  expect(isHttpsUrl('http://covers.openlibrary.org/b/id/1-L.jpg')).toBe(false);
  expect(isHttpsUrl('https://')).toBe(false);
  expect(isHttpsUrl('javascript:alert(1)')).toBe(false);
  expect(isHttpsUrl('https://x.com/' + 'a'.repeat(500))).toBe(false);
});
