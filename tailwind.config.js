// ใช้ตัวแปร CSS แบบ "R G B" เพื่อให้ bg-ink/40 (ความโปร่ง) ยังใช้ได้
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',                                    // <html class="dark"> = โหมดมืด (ThemeContext สลับให้)
  theme: {
    extend: {
      // สีของ Book Review ตาม palette colorhunt BBDCE5 / ECEEDF / D9C4B0 / CFAB8D + ขาว
      // ชื่อโทเคนเดิม (ทุกหน้าใช้อยู่) เปลี่ยนแค่ค่า:
      //   ink = ตัวอักษรน้ำตาลเข้ม, cloth = น้ำตาลแทนเข้ม (ปุ่ม/ลิงก์), gilt = ดาว, paper = ขาว, line = เส้นเบจ, sky = ฟ้าพาสเทล
      // (สีใน palette อ่อนเกินจะใช้เป็นตัวอักษร จึงเพิ่มเฉดเข้มที่มาจาก #CFAB8D ไว้สำหรับตัวอักษรและปุ่ม)
      // สีทุกตัวอ่านจากตัวแปร CSS ใน index.css (:root = โหมดสว่าง, .dark = โหมดมืด)
      // หน้าไหนใช้ text-ink / bg-white ฯลฯ ก็เปลี่ยนตามโหมดเองโดยไม่ต้องเขียน dark: ทุกที่
      colors: {
        white: c('surface'),                            // พื้นการ์ด/ช่องกรอก (โหมดมืด = น้ำตาลเข้ม)
        page: c('page'),                                // พื้นหลังทั้งหน้า
        'on-accent': c('on-accent'),                    // ตัวอักษรบนปุ่มสีน้ำตาล
        ink: { DEFAULT: c('ink'), soft: c('ink-soft'), faint: c('ink-faint') },
        cloth: { DEFAULT: c('cloth'), dark: c('cloth-dark'), light: c('cloth-light') },
        gilt: { DEFAULT: c('gilt'), light: c('gilt-light') },
        paper: { DEFAULT: c('surface'), shade: c('paper-shade') },
        line: c('line'),
        sky: { DEFAULT: c('sky'), light: c('sky-light'), deep: c('sky-deep') },
        // ชื่อที่หน้าแรกใช้
        cream: { DEFAULT: c('cream'), deep: c('cream-deep') },
        latte: { DEFAULT: c('latte'), deep: c('latte-deep') },
        caramel: { DEFAULT: c('cloth'), dark: c('cloth-dark'), wood: c('wood') },
        cocoa: { DEFAULT: c('ink'), soft: c('ink-soft') },
        honey: c('gilt'),
      },
      fontFamily: {
        // เนื้อหา: Nunito (อังกฤษ) + Noto Sans Thai Looped (ไทย มีหัว อ่านง่าย) / หัวข้อ: Mitr กลมมน
        sans: ['Nunito', '"Noto Sans Thai Looped"', 'system-ui', 'sans-serif'],
        serif: ['Mitr', 'system-ui', 'sans-serif'],
        round: ['Mitr', 'system-ui', 'sans-serif'],                                  // หัวข้อ กลมมน
        warm: ['Nunito', '"Noto Sans Thai Looped"', 'system-ui', 'sans-serif'],      // เนื้อหา อ่านง่าย
      },
      borderRadius: {                                   // มุมโค้งมนขึ้นทั้งเว็บ
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
      },
      boxShadow: {
        cover: '0 1px 2px rgba(59,49,42,.18), 0 8px 16px -8px rgba(59,49,42,.38)',
        // หนังสือ 3 มิติ (components/ui/Book.jsx)
        book: '0 1px 1px 0 rgba(59,49,42,.04), 0 4px 8px -4px rgba(59,49,42,.2), 0 16px 24px -8px rgba(59,49,42,.14)',
        'book-border': 'inset 0 1px 2px 0 rgba(255,255,255,.3)',
      },
      backgroundImage: {
        'book-bind': 'var(--book-bind)',
        'book-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F6F7EF 100%)',
        'book-texture': 'repeating-linear-gradient(45deg, rgba(0,0,0,.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(-45deg, rgba(0,0,0,.03) 0 1px, transparent 1px 3px)',
      },
    },
  },
  plugins: [],
};
