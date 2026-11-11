import { toBook, cleanDescription, searchBooks, getBooks, getBook } from './openlibrary';

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

test('toBook แปลงผลค้นหาเป็นรูปร่างเดียวกับหนังสือจาก backend', () => {
  expect(toBook({ key: '/works/OL27448W', title: 'The Lord of the Rings', author_name: ['A', 'B', 'C', 'D'], first_publish_year: 1954, cover_i: 9 }))
    .toEqual(expect.objectContaining({
      id: 'OL27448W', openlibraryKey: 'OL27448W', title: 'The Lord of the Rings', author: 'A, B, C',
      publishedYear: 1954, coverUrl: 'https://covers.openlibrary.org/b/id/9-M.jpg',
    }));
  const noData = toBook({ key: '/works/OL1W', title: 'X' });
  expect(noData.author).toBe('ไม่ทราบผู้แต่ง');
  expect(noData.coverUrl).toBeNull();
  expect(noData.publishedYear).toBeNull();
});

test('cleanDescription รับได้ทั้ง string และ { value } และตัดส่วนท้าย', () => {
  expect(cleanDescription('Plain.')).toBe('Plain.');
  expect(cleanDescription({ type: '/type/text', value: 'Hi [there](https://x).\r\n\r\n----------\r\nSee also' })).toBe('Hi there.');
  expect(cleanDescription(undefined)).toBeNull();
});

test('searchBooks ส่ง q fields limit page และกรองรายการที่ key ไม่ถูกรูปแบบทิ้ง', async () => {
  fetch.mockResolvedValue(fakeResponse(200, {
    numFound: 2, docs: [{ key: '/works/OL1W', title: 'Good' }, { key: '/books/OL2M', title: 'Edition, not work' }],
  }));
  const result = await searchBooks('ทอลคีน', 3);
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.pathname).toBe('/search.json');
  expect(url.searchParams.get('q')).toBe('ทอลคีน');
  expect(url.searchParams.get('page')).toBe('3');
  expect(url.searchParams.get('fields')).toContain('cover_i');
  expect(result.items.map(b => b.id)).toEqual(['OL1W']);
  expect(result.total).toBe(2);
});

test('getBooks ค้นตาม subject และจำผลไว้วันละครั้ง (ครั้งที่สองไม่ยิง fetch)', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { numFound: 1, docs: [{ key: '/works/OL5W', title: 'Cached' }] }));
  const first = await getBooks('science fiction', 1);
  const second = await getBooks('science fiction', 1);
  expect(new URL(fetch.mock.calls[0][0]).searchParams.get('q')).toBe('subject:"science fiction" language:eng');
  expect(second).toEqual(first);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('getBook รวมข้อมูล work กับชื่อผู้แต่ง', async () => {
  fetch.mockImplementation((url) => {
    const path = new URL(url).pathname;
    if (path === '/works/OL7W.json') {
      return Promise.resolve(fakeResponse(200, {
        title: 'Detail', covers: [-1, 44], first_publish_date: 'May 1, 1990',
        description: { value: 'Story.' }, authors: [{ author: { key: '/authors/OL1A' } }],
      }));
    }
    if (path === '/authors/OL1A.json') return Promise.resolve(fakeResponse(200, { name: 'Writer One' }));
    return Promise.resolve(fakeResponse(404, {}));
  });
  const b = await getBook('OL7W');
  expect(b).toEqual(expect.objectContaining({
    id: 'OL7W', title: 'Detail', author: 'Writer One', publishedYear: 1990, description: 'Story.',
    coverUrl: 'https://covers.openlibrary.org/b/id/44-L.jpg',
  }));
  await expect(getBook('not-a-key')).rejects.toThrow();
});

test('Open Library ตอบไม่ใช่ 2xx ต้องโยน Error', async () => {
  fetch.mockResolvedValue(fakeResponse(503, {}));
  await expect(searchBooks('x')).rejects.toThrow('Open Library ตอบกลับ 503');
});
