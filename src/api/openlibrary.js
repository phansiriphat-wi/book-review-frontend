// ชั้นกลางสำหรับคุยกับ Open Library (แนวเดียวกับ tmdb.js ของ MovieHub) ทุกหน้าเรียกผ่านไฟล์นี้เท่านั้น
// Open Library ไม่ต้องใช้ API key  เอกสาร: https://openlibrary.org/developers/api
import { onceADay } from './cache';

// เปลี่ยนต้นทางได้เฉพาะตอนทดสอบกับ server จำลอง (ปกติปล่อยว่าง)
const BASE = process.env.REACT_APP_OPENLIBRARY_URL || 'https://openlibrary.org';
export const COVERS = process.env.REACT_APP_OPENLIBRARY_COVERS || 'https://covers.openlibrary.org/b/id';
export const PAGE_SIZE = 24;
const FIELDS = 'key,title,author_name,first_publish_year,cover_i';
export const KEY_PATTERN = /^OL\d+W$/;                 // รหัส work ของ Open Library เช่น OL27448W

// ตัวช่วยกลาง: ประกอบ URL ส่ง request เช็กผล แปลงเป็น object
export async function getJSON(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);                 // เข้ารหัสภาษาไทยและช่องว่างให้เอง
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open Library ตอบกลับ ${res.status}`);
  }
  return res.json();
}

export function coverUrl(coverId, size = 'M') {
  return coverId ? `${COVERS}/${coverId}-${size}.jpg` : null;
}

// แปลงผลค้นหาของ Open Library ให้เป็นรูปร่างเดียวกับหนังสือจาก Go backend เพื่อให้ BookCard ใช้ได้ทันที
//   id ใช้รหัส Open Library (OL…W) ลิงก์ /books/{id} จึงใช้ได้ทั้งหนังสือในระบบและจาก Open Library
export function toBook(doc) {
  const key = (doc.key || '').replace('/works/', '');
  return {
    id: key,
    openlibraryKey: key,
    title: doc.title,
    author: doc.author_name?.length ? doc.author_name.slice(0, 3).join(', ') : 'ไม่ทราบผู้แต่ง',
    publishedYear: doc.first_publish_year ?? null,
    coverUrl: coverUrl(doc.cover_i),
    description: null,
    category: null,
    avgRating: null,
    reviewCount: 0,
  };
}

// เรื่องย่อของ Open Library มาได้ 2 แบบ: string หรือ { type, value }  และมักมีส่วน "See also" ต่อท้าย
export function cleanDescription(d) {
  let text = typeof d === 'string' ? d : d?.value;
  if (!text) return null;
  text = text.split(/\r?\n-{3,}/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\[\d+\]:.*$/gm, '')
    .trim();
  return text || null;
}

async function searchList(q, page) {
  const data = await getJSON('/search.json', { q, fields: FIELDS, limit: PAGE_SIZE, page });
  const items = (data.docs || [])
    .filter(d => KEY_PATTERN.test((d.key || '').replace('/works/', '')) && d.title)
    .map(toBook);
  return { items, total: data.numFound ?? data.num_found ?? items.length, page, pageSize: PAGE_SIZE };
}

// หนังสือตามหมวด (subject ของ Open Library) โหลดจริงวันละครั้งต่อหมวดต่อหน้า ที่เหลืออ่านจาก localStorage
export function getBooks(subject, page = 1) {
  return onceADay(`bookreview.ol.${subject}.${page}`, () =>
    searchList(`subject:"${subject}" language:eng`, page));
}

// ค้นจากชื่อหนังสือหรือชื่อผู้แต่ง (q ของ Open Library ค้นทั้งสองอย่าง) ใส่ subject เพื่อค้นในหมวดเดียวได้
export function searchBooks(query, page = 1, subject = null) {
  const q = subject ? `${query} subject:"${subject}"` : query;
  return searchList(q, page);
}

// รายละเอียดเล่มเดียวจาก /works/{key}.json  ชื่อผู้แต่งต้องขอแยกจาก /authors/{id}.json
export async function getBook(key) {
  if (!KEY_PATTERN.test(key)) throw new Error('รหัสหนังสือไม่ถูกต้อง');
  const work = await getJSON(`/works/${key}.json`);
  const authorKeys = (work.authors || []).map(a => a.author?.key).filter(Boolean).slice(0, 3);
  const names = await Promise.all(authorKeys.map(k =>
    getJSON(`${k}.json`).then(a => a.name).catch(() => null)));
  const year = String(work.first_publish_date || '').match(/\b(1\d{3}|20\d{2})\b/);
  return {
    id: key,
    openlibraryKey: key,
    title: work.title,
    author: names.filter(Boolean).join(', ') || 'ไม่ทราบผู้แต่ง',
    publishedYear: year ? Number(year[1]) : null,
    coverUrl: coverUrl((work.covers || []).find(c => c > 0), 'L'),
    description: cleanDescription(work.description),
    category: null,
    subjects: (work.subjects || []).slice(0, 8),
    avgRating: null,
    reviewCount: 0,
  };
}
