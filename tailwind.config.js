/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // สีของ Book Review ตาม palette colorhunt BBDCE5 / ECEEDF / D9C4B0 / CFAB8D + ขาว
      // ชื่อโทเคนเดิม (ทุกหน้าใช้อยู่) เปลี่ยนแค่ค่า:
      //   ink = ตัวอักษรน้ำตาลเข้ม, cloth = น้ำตาลแทนเข้ม (ปุ่ม/ลิงก์), gilt = ดาว, paper = ขาว, line = เส้นเบจ, sky = ฟ้าพาสเทล
      // (สีใน palette อ่อนเกินจะใช้เป็นตัวอักษร จึงเพิ่มเฉดเข้มที่มาจาก #CFAB8D ไว้สำหรับตัวอักษรและปุ่ม)
      colors: {
        white: '#FFFFFF',
        ink: { DEFAULT: '#3B312A', soft: '#6B5B4E', faint: '#776656' },
        cloth: { DEFAULT: '#8A6448', dark: '#6E4E37', light: '#F3EBE3' },
        gilt: { DEFAULT: '#C9965F', light: '#F5EBDD' },
        paper: { DEFAULT: '#FFFFFF', shade: '#F6F7EF' },
        line: '#E8DCCF',
        sky: { DEFAULT: '#BBDCE5', light: '#E6F2F5', deep: '#8FBFCC' },
        // ชื่อที่หน้าแรกใช้
        cream: { DEFAULT: '#FBFBF6', deep: '#ECEEDF' },
        latte: { DEFAULT: '#D9C4B0', deep: '#CFAB8D' },
        caramel: { DEFAULT: '#8A6448', dark: '#6E4E37', wood: '#B48A68' },
        cocoa: { DEFAULT: '#3B312A', soft: '#6B5B4E' },
        honey: '#C9965F',
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
