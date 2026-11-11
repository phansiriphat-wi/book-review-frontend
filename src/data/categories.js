import { useEffect, useState } from 'react';
import { getCategories } from '../api/backend';

// หมวดหมู่สำรอง: ใช้เมื่อเรียก GET /api/categories ไม่ได้ (backend ยังไม่ตื่น) หน้า Books ยังค้นจาก Open Library ได้
// ต้องตรงกับ INSERT INTO categories ใน schema.sql ของ book-review-backend
export const FALLBACK_CATEGORIES = [
  { name: 'Fantasy',         nameTh: 'แฟนตาซี',          olSubject: 'fantasy' },
  { name: 'Science Fiction', nameTh: 'นิยายวิทยาศาสตร์',   olSubject: 'science fiction' },
  { name: 'Mystery',         nameTh: 'สืบสวนสอบสวน',      olSubject: 'mystery' },
  { name: 'Romance',         nameTh: 'โรแมนติก',          olSubject: 'romance' },
  { name: 'Horror',          nameTh: 'สยองขวัญ',          olSubject: 'horror' },
  { name: 'History',         nameTh: 'ประวัติศาสตร์',       olSubject: 'history' },
  { name: 'Biography',       nameTh: 'ชีวประวัติ',          olSubject: 'biography' },
  { name: 'Children',        nameTh: 'หนังสือเด็ก',         olSubject: "children's fiction" },
  { name: 'General',         nameTh: 'ทั่วไป',             olSubject: null },
];

export function categoryLabel(name, list = FALLBACK_CATEGORIES) {
  return list.find(c => c.name === name)?.nameTh ?? name;
}

// โหลดหมวดจาก backend ครั้งเดียวต่อการเปิดหน้า ระหว่างรอ (หรือถ้าพลาด) ใช้รายการสำรอง
let cached = null;
export function useCategories() {
  const [list, setList] = useState(cached ?? FALLBACK_CATEGORIES);
  useEffect(() => {
    if (cached) return;
    let ignore = false;
    getCategories()
      .then(items => {
        if (!ignore && Array.isArray(items) && items.length) {
          cached = items;
          setList(items);
        }
      })
      .catch(() => {});                                  // ใช้รายการสำรองต่อไป
    return () => { ignore = true; };
  }, []);
  return list;
}

export function resetCategoryCache() {
  cached = null;                                         // ใช้ในเทสต์
}
