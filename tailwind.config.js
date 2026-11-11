/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // สีของ Book Review: หมึกน้ำเงิน, ผ้าปกเขียว (ปุ่ม/ลิงก์), ทองปั๊มปก (ใช้กับดาวเท่านั้น)
      colors: {
        ink: { DEFAULT: '#1F2A44', soft: '#4A5568', faint: '#8792A2' },
        cloth: { DEFAULT: '#2F5D50', dark: '#244A40', light: '#E6EFEC' },
        gilt: { DEFAULT: '#B8901E', light: '#F4EBD0' },
        paper: { DEFAULT: '#FFFFFF', shade: '#F3F5F8' },
        line: '#E2E6EC',
      },
      fontFamily: {
        sans: ['Prompt', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif Thai"', 'Georgia', 'serif'],
      },
      boxShadow: {
        cover: '0 1px 2px rgba(31,42,68,.18), 0 8px 16px -8px rgba(31,42,68,.35)',
      },
    },
  },
  plugins: [],
};
