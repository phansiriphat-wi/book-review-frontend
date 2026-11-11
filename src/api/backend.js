// ชั้นกลางสำหรับคุยกับ Go backend ของเรา (แนวเดียวกับ backend.js ของ MovieHub)
// '' = origin เดียวกับหน้าเว็บ ตอนพัฒนา CRA จะ proxy /api ไปที่ http://localhost:8080 (ตั้งใน package.json)
// บน Vercel ตั้ง REACT_APP_API_URL=https://<ชื่อ service>.onrender.com
const BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export const UNAUTHORIZED_EVENT = 'bookreview:unauthorized';

// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่');
  }

  if (res.status === 204) return null;                      // ลบสำเร็จ ไม่มี body ให้อ่าน

  const data = await res.json()
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON (backend ยังไม่พร้อม?)' }));
  if (!res.ok) {
    // Go ตอบ { error: { code, message } }
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;
    err.code = data.error?.code;
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT)); // ตั๋วหมดอายุ ให้ AuthContext ออกจากระบบ
    }
    throw err;
  }
  return data;
}

function qs(params) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') s.set(k, v);
  }
  const str = s.toString();
  return str ? `?${str}` : '';
}

// ---------- สมาชิก ----------
export function register(name, email, password) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { name, email, password } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, user }
}
export function getMe(token) {
  return apiFetch('/api/auth/me', { token });
}

// ---------- หนังสือในระบบ ({ref} = เลขในระบบ หรือรหัส Open Library) ----------
export async function getCategories() {
  const data = await apiFetch('/api/categories');
  return data.items;                                       // [{ name, nameTh, olSubject }]
}
export function listBooks({ q, category, sort, page = 1, pageSize = 24 } = {}) {
  return apiFetch('/api/books' + qs({ q, category, sort, page, pageSize }));   // { items, total, page, pageSize }
}
export function getBook(ref) {
  return apiFetch(`/api/books/${encodeURIComponent(ref)}`);
}
export async function getRatings(keys) {
  if (keys.length === 0) return [];
  const data = await apiFetch('/api/books/ratings' + qs({ keys: keys.join(',') }));
  return data.items;                                       // [{ openlibraryKey, bookId, avgRating, reviewCount }]
}

// ---------- รีวิว ----------
export function getReviews(ref) {
  return apiFetch(`/api/books/${encodeURIComponent(ref)}/reviews`);   // { bookId, items, avgRating, reviewCount }
}
export function postReview(ref, { rating, comment, category }, token) {
  return apiFetch(`/api/books/${encodeURIComponent(ref)}/reviews`, { method: 'POST', body: { rating, comment, category }, token });
}
export function updateReview(id, { rating, comment }, token) {
  return apiFetch(`/api/reviews/${id}`, { method: 'PUT', body: { rating, comment }, token });
}
export function deleteReview(id, token) {
  return apiFetch(`/api/reviews/${id}`, { method: 'DELETE', token });
}

// ---------- Wishlist ----------
export async function getWishlist(token) {
  const data = await apiFetch('/api/wishlist', { token });
  return data.items;
}
export function addToWishlist(ref, token, category) {
  return apiFetch('/api/wishlist', { method: 'POST', body: { bookId: String(ref), category }, token });
}
export function removeFromWishlist(ref, token) {
  return apiFetch(`/api/wishlist/${encodeURIComponent(ref)}`, { method: 'DELETE', token });
}

// ---------- หลังบ้าน (ต้องเป็น admin ถ้าเป็น member Go ตอบ 403) ----------
export function getAdminStats(token) {
  return apiFetch('/api/admin/stats', { token });
}
export async function getAdminUsers(token) {
  const data = await apiFetch('/api/admin/users', { token });
  return data.items;
}
export function getAdminReviews({ q, page = 1, pageSize = 20 }, token) {
  return apiFetch('/api/admin/reviews' + qs({ q, page, pageSize }), { token });
}
export function getAdminBook(ref, token) {
  return apiFetch(`/api/admin/books/${encodeURIComponent(ref)}`, { token });   // { book, impact }
}
export function createBook(fields, token) {
  return apiFetch('/api/books', { method: 'POST', body: fields, token });
}
export function updateBook(id, fields, token) {
  return apiFetch(`/api/books/${id}`, { method: 'PUT', body: fields, token });
}
export function deleteBook(id, token) {
  return apiFetch(`/api/books/${id}`, { method: 'DELETE', token });
}
