import { createContext, useContext, useEffect, useState } from 'react';

// โหมดสว่าง/มืด เก็บใน Context เหมือน AuthContext ทุกคอมโพเนนต์เรียก useTheme() ได้
// ค่าที่เลือกจำไว้ใน localStorage ถ้ายังไม่เคยเลือก ใช้ตามการตั้งค่าของเครื่อง
// (public/index.html ใส่ class="dark" ให้ก่อน React โหลด หน้าจอจึงไม่กะพริบขาว)
const STORAGE_KEY = 'bookreview.theme';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

function initialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17120F' : '#FBFBF6');
  }, [theme]);

  function toggleTheme() {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* โหมดส่วนตัวบางเบราว์เซอร์เขียนไม่ได้ ไม่เป็นไร */ }
      return next;
    });
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
