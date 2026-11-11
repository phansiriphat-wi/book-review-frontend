import { useEffect, useState } from 'react';

// เบรกพอยต์เดียวกับ Tailwind (ค่าเริ่มต้น) เรียงจากเล็กไปใหญ่
const BREAKPOINTS = [['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280]];

function pick(value) {
  if (value == null || typeof value !== 'object') return value;
  // mobile-first: ค่าเล็กสุดที่ระบุเป็นค่าตั้งต้น แล้วทับด้วยเบรกพอยต์ที่จอกว้างพอ
  let out;
  for (const [key, min] of BREAKPOINTS) {
    if (value[key] == null) continue;
    if (out === undefined) out = value[key];
    if (typeof window !== 'undefined' && window.matchMedia?.(`(min-width: ${min}px)`).matches) out = value[key];
  }
  return out;
}

// รับค่าเดี่ยว (196, '100%') หรือ object ตามเบรกพอยต์ ({ sm: 140, lg: 196 }) คืนค่าที่ใช้กับจอตอนนี้
export function useResponsive(value) {
  const [current, setCurrent] = useState(() => pick(value));
  const key = JSON.stringify(value);

  useEffect(() => {
    setCurrent(pick(value));
    if (value == null || typeof value !== 'object' || typeof window === 'undefined' || !window.matchMedia) return;
    const lists = BREAKPOINTS.map(([, min]) => window.matchMedia(`(min-width: ${min}px)`));
    const onChange = () => setCurrent(pick(value));
    lists.forEach(l => l.addEventListener?.('change', onChange));
    return () => lists.forEach(l => l.removeEventListener?.('change', onChange));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return current;
}
