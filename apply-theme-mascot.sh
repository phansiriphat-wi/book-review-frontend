#!/usr/bin/env bash
# โหมดมืด/สว่าง + น้องบุ๊ค (ตัวการ์ตูนหน้า Login/Register และจ๊ะเอ๋หน้าแรก)
# วิธีใช้: รันที่ root ของ book-review-frontend   bash apply-theme-mascot.sh
# แก้ไฟล์ใน workspace เท่านั้น ไม่ commit ไม่ push ไม่ติดตั้งไลบรารีเพิ่ม
set -euo pipefail
[ -f package.json ] && [ -f src/components/Navbar.jsx ] || { echo "ให้รันที่ root ของ book-review-frontend"; exit 1; }
[ ! -e src/theme/ThemeContext.jsx ] || { echo "มี src/theme/ThemeContext.jsx อยู่แล้ว (อาจรันไปแล้ว) หยุดเพื่อไม่ให้แก้ซ้ำ"; exit 1; }
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/theme-mascot.patch" <<'EOF_PATCH_THEME_MASCOT'
diff --git a/public/index.html b/public/index.html
index 7d5e0c0..e7b6454 100644
--- a/public/index.html
+++ b/public/index.html
@@ -12,6 +12,15 @@
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
     <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600&family=Nunito:wght@400;600;700&family=Noto+Sans+Thai+Looped:wght@400;500;600&display=swap" rel="stylesheet" />
     <title>Book Review</title>
+    <script>
+      // ใส่ class="dark" ก่อน React โหลด กันจอกะพริบสีขาวตอนเปิดหน้า (ค่าเดียวกับ src/theme/ThemeContext.jsx)
+      try {
+        var saved = localStorage.getItem('bookreview.theme');
+        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
+          document.documentElement.classList.add('dark');
+        }
+      } catch (e) {}
+    </script>
   </head>
   <body>
     <noscript>ต้องเปิด JavaScript เพื่อใช้งานเว็บนี้</noscript>
diff --git a/src/components/BookCover.jsx b/src/components/BookCover.jsx
index 17e5ef0..30f4443 100644
--- a/src/components/BookCover.jsx
+++ b/src/components/BookCover.jsx
@@ -14,7 +14,7 @@ function BookCover({ src, title, className = '', size = 'md' }) {
     <div role="img" aria-label={`ปกหนังสือ ${title}`}
          className={'flex aspect-[2/3] w-full flex-col justify-between rounded-[3px] bg-cloth p-3 text-left shadow-cover ' + className}>
       <span className="h-px w-8 bg-gilt" />
-      <span className={'line-clamp-4 font-serif font-semibold leading-snug text-white ' + (size === 'lg' ? 'text-xl' : 'text-sm')}>
+      <span className={'line-clamp-4 font-serif font-semibold leading-snug text-on-accent ' + (size === 'lg' ? 'text-xl' : 'text-sm')}>
         {title}
       </span>
       <span className="h-px w-8 bg-gilt" />
diff --git a/src/components/Navbar.jsx b/src/components/Navbar.jsx
index ee0561a..f2b63ab 100644
--- a/src/components/Navbar.jsx
+++ b/src/components/Navbar.jsx
@@ -1,6 +1,7 @@
 import { useState } from 'react';
 import { NavLink, Link, useNavigate } from 'react-router-dom';
 import { useAuth } from '../auth/AuthContext';
+import ThemeToggle from './ThemeToggle';
 
 // ลิงก์เมนูทรงเม็ดยา: หน้าที่เปิดอยู่เป็นเม็ดสีโกโก้เข้ม ตัวอักษรครีม
 const linkClass = ({ isActive }) =>
@@ -46,7 +47,7 @@ function Navbar() {
     <>
       <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-[15px] text-ink-soft hover:bg-latte/30 hover:text-cloth-dark">เข้าสู่ระบบ</Link>
       <Link to="/register" onClick={() => setOpen(false)}
-            className="lift inline-flex min-h-11 items-center rounded-xl bg-cloth px-4 text-[15px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-cloth-dark">
+            className="lift inline-flex min-h-11 items-center rounded-xl bg-cloth px-4 text-[15px] font-semibold text-on-accent shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-cloth-dark">
         สมัครสมาชิก
       </Link>
     </>
@@ -72,9 +73,11 @@ function Navbar() {
                    placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                    className="min-h-10 w-full rounded-xl border border-latte/80 bg-white/70 px-3.5 text-sm placeholder:text-ink-faint focus:border-cloth/50 focus:bg-white/80 focus:outline-none" />
           </form>
+          <ThemeToggle className="hidden md:grid" />
           <div className="hidden items-center gap-1 md:flex">{account}</div>
 
-          <button className="ml-auto min-h-11 rounded-xl border border-latte/80 bg-white/70 px-4 text-sm font-medium md:hidden"
+          <ThemeToggle className="ml-auto h-11 w-11 md:hidden" />
+          <button className="min-h-11 rounded-xl border border-latte/80 bg-white/70 px-4 text-sm font-medium md:hidden"
                   aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(o => !o)}>
             {open ? 'ปิดเมนู' : 'เมนู'}
           </button>
diff --git a/src/components/PasswordInput.jsx b/src/components/PasswordInput.jsx
new file mode 100644
index 0000000..1c6994a
--- /dev/null
+++ b/src/components/PasswordInput.jsx
@@ -0,0 +1,23 @@
+import { inputClass } from './admin/AdminStates';
+
+// ช่องรหัสผ่านพร้อมปุ่มแสดง/ซ่อน (ใช้ทั้งหน้า Login และ Register)
+// onFocus/onBlur ของช่องกรอกส่งต่อให้หน้าแม่ ปุ่มแสดงรหัสกดแล้วไม่ทำให้ช่องหลุดโฟกัส
+function PasswordInput({ show, onToggle, ...input }) {
+  return (
+    <div className="relative">
+      <input {...input} type={show ? 'text' : 'password'} className={inputClass + ' pr-12'} />
+      <button type="button" onClick={onToggle} onMouseDown={(e) => e.preventDefault()}
+              aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={show}
+              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-ink-faint hover:text-cloth">
+        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"
+             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
+          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
+          <circle cx="12" cy="12" r="3" />
+          {!show && <path d="M4 4l16 16" />}
+        </svg>
+      </button>
+    </div>
+  );
+}
+
+export default PasswordInput;
diff --git a/src/components/ReviewForm.jsx b/src/components/ReviewForm.jsx
index 297d259..278d220 100644
--- a/src/components/ReviewForm.jsx
+++ b/src/components/ReviewForm.jsx
@@ -45,7 +45,7 @@ function ReviewForm({ bookTitle, initial, submitLabel = 'ส่งรีวิ
       </div>
       <div className="flex flex-wrap items-center gap-3">
         <button type="submit" disabled={!ready || submitting}
-                className="rounded-md bg-cloth px-5 py-2 text-sm font-medium text-white hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint">
+                className="rounded-md bg-cloth px-5 py-2 text-sm font-medium text-on-accent hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint">
           {submitting ? 'กำลังบันทึก...' : submitLabel}
         </button>
         {onCancel && (
diff --git a/src/components/StarRating.jsx b/src/components/StarRating.jsx
index 6c7eec8..b47a832 100644
--- a/src/components/StarRating.jsx
+++ b/src/components/StarRating.jsx
@@ -8,7 +8,7 @@ function Star({ fill, className }) {
       <defs>
         <linearGradient id={id}>
           <stop offset={`${fill * 100}%`} stopColor="currentColor" />
-          <stop offset={`${fill * 100}%`} stopColor="#E8DCCF" />
+          <stop offset={`${fill * 100}%`} style={{ stopColor: 'rgb(var(--line))' }} />
         </linearGradient>
       </defs>
       <path fill={`url(#${id})`}
@@ -45,7 +45,7 @@ export function StarInput({ value, onChange, disabled, name = 'rating' }) {
             <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)}
                    className="peer sr-only" aria-label={`${n} ดาว`} />
             <span className={'block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-cloth ' +
-                             (value >= n ? 'text-gilt' : 'text-[#D9C4B0] hover:text-gilt')}>
+                             (value >= n ? 'text-gilt' : 'text-latte hover:text-gilt')}>
               <svg viewBox="0 0 20 20" className="h-7 w-7" aria-hidden="true">
                 <path fill="currentColor" d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6l-5.2 2.9L6 11.7 1.6 7.7l5.9-.7z" />
               </svg>
diff --git a/src/components/ThemeToggle.jsx b/src/components/ThemeToggle.jsx
new file mode 100644
index 0000000..22dbe11
--- /dev/null
+++ b/src/components/ThemeToggle.jsx
@@ -0,0 +1,27 @@
+import { useTheme } from '../theme/ThemeContext';
+
+// ปุ่มสลับโหมด: ดวงอาทิตย์หมุนหายแล้วพระจันทร์หมุนเข้ามา (และกลับกัน)
+function ThemeToggle({ className = '' }) {
+  const { theme, toggleTheme } = useTheme();
+  const dark = theme === 'dark';
+  return (
+    <button type="button" onClick={toggleTheme}
+            aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'} title={dark ? 'โหมดสว่าง' : 'โหมดมืด'}
+            className={'theme-toggle relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-latte/80 bg-white/70 text-cloth hover:border-cloth ' + className}>
+      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9"
+           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
+           className={'theme-icon absolute ' + (dark ? 'is-off' : '')}>
+        <circle cx="12" cy="12" r="4.2" />
+        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
+      </svg>
+      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9"
+           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
+           className={'theme-icon absolute ' + (dark ? '' : 'is-off')}>
+        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
+        <path d="M17 3.5v2.5M15.75 4.75h2.5" />
+      </svg>
+    </button>
+  );
+}
+
+export default ThemeToggle;
diff --git a/src/components/admin/AdminStates.jsx b/src/components/admin/AdminStates.jsx
index 3080d89..71819a1 100644
--- a/src/components/admin/AdminStates.jsx
+++ b/src/components/admin/AdminStates.jsx
@@ -27,7 +27,7 @@ export function Notice({ children, tone = 'success' }) {
 }
 
 export const btnPrimary =
-  'inline-flex items-center justify-center rounded-md bg-cloth px-4 py-2 text-sm font-medium text-white hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint';
+  'inline-flex items-center justify-center rounded-md bg-cloth px-4 py-2 text-sm font-medium text-on-accent hover:bg-cloth-dark disabled:cursor-not-allowed disabled:bg-ink-faint';
 export const btnGhost =
   'inline-flex items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm text-ink hover:border-cloth hover:text-cloth disabled:cursor-not-allowed disabled:opacity-50';
 export const btnDanger =
@@ -40,7 +40,7 @@ export const labelClass = 'mb-1 block text-sm font-medium text-ink';
 export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
   if (!open) return null;
   return (
-    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
+    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
       <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
         <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
         <div className="mt-2 text-sm text-ink-soft">{children}</div>
diff --git a/src/components/mascot/AuthStage.jsx b/src/components/mascot/AuthStage.jsx
new file mode 100644
index 0000000..baabf34
--- /dev/null
+++ b/src/components/mascot/AuthStage.jsx
@@ -0,0 +1,38 @@
+import BookBuddy from './BookBuddy';
+
+// เวทีของน้องบุ๊คในหน้า Login / Register: กล่องคำพูด + ตัวการ์ตูนลอยขึ้นลง + ดาวและหนังสือเล่มเล็กลอยไปมา
+// เป็นของตกแต่ง ข้อความสำคัญ (error) ยังแสดงในฟอร์มตามเดิม
+const Star = ({ className, style }) => (
+  <svg viewBox="0 0 24 24" className={'drift ' + className} style={style}>
+    <path d="M12 2.5l2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 16.4l-5.6 3.3 1.4-6.3L3 9.1l6.4-.6z" fill="currentColor" />
+  </svg>
+);
+const MiniBook = ({ className, style, color }) => (
+  <svg viewBox="0 0 32 26" className={'drift ' + className} style={style}>
+    <path d="M2 4c5-2 9-2 14 1 5-3 9-3 14-1v19c-5-2-9-2-14 1-5-3-9-3-14-1z" fill={color} stroke="#3B312A" strokeWidth="1.8" strokeLinejoin="round" />
+    <path d="M16 5v19" stroke="#3B312A" strokeWidth="1.6" />
+  </svg>
+);
+
+function AuthStage({ bubble, ...buddy }) {
+  return (
+    <div aria-hidden="true"
+         className="relative flex items-center gap-4 overflow-hidden rounded-[28px] border border-latte-deep/50 bg-cloth-light/80 px-5 py-4 shadow-[0_18px_40px_-24px_rgb(var(--shadow)/.6)] md:block md:rounded-[32px] md:px-6 md:pb-10 md:pt-10 md:text-center">
+      <Star className="left-[8%] top-[14%] w-5 text-gilt" style={{ '--t': '6s', '--r': '-10deg' }} />
+      <Star className="right-[12%] top-[10%] w-7 text-gilt" style={{ '--t': '8s', '--d': '-2s', '--x': '-8px' }} />
+      <Star className="bottom-[22%] right-[8%] w-4 text-sky-deep" style={{ '--t': '5s', '--d': '-1s' }} />
+      <MiniBook className="left-[10%] bottom-[18%] w-9" color="#7FB3C2" style={{ '--t': '9s', '--r': '-14deg', '--y': '-18px' }} />
+      <MiniBook className="right-[18%] top-[38%] w-7" color="#E6C07E" style={{ '--t': '7s', '--d': '-3s', '--r': '10deg' }} />
+
+      {/* มือถือ: ตัวการ์ตูนซ้าย กล่องคำพูดขวา (เตี้ย ไม่ดันฟอร์มลงไป) / จอใหญ่: กล่องคำพูดอยู่บนหัว */}
+      <p className="relative order-2 inline-block max-w-[16rem] rounded-2xl border border-latte-deep/50 bg-white px-4 py-2 font-round text-sm leading-snug text-ink shadow-sm md:order-none md:mx-auto md:text-base">
+        {bubble}
+        <span className="absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-latte-deep/50 bg-white md:hidden" />
+        <span className="absolute -bottom-[7px] left-1/2 hidden h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-latte-deep/50 bg-white md:block" />
+      </p>
+      <BookBuddy {...buddy} className="bob relative w-24 shrink-0 md:mx-auto md:mt-4 md:w-56" />
+    </div>
+  );
+}
+
+export default AuthStage;
diff --git a/src/components/mascot/BookBuddy.jsx b/src/components/mascot/BookBuddy.jsx
new file mode 100644
index 0000000..e648814
--- /dev/null
+++ b/src/components/mascot/BookBuddy.jsx
@@ -0,0 +1,112 @@
+import { useEffect, useRef, useState } from 'react';
+
+// "น้องบุ๊ค" ตัวการ์ตูนหนังสือ วาดด้วย SVG ล้วน ไม่ใช้ไลบรารี
+//   look        {x, y} ค่า -1..1 ให้ตามองไปทางนั้น (null = ไม่กำหนด)
+//   followPointer  ไม่ได้กำหนด look ให้ตามองตามเมาส์
+//   mood        'smile' | 'happy' | 'oops' | 'wow'
+//   coverEyes   เอามือปิดตา (ตอนพิมพ์รหัสผ่าน)  peekThrough = แง้มนิ้วแอบดู
+//   waving      โบกมือ   arms / legs = false ซ่อนแขนขา (ตอนแอบหลังหนังสือ)
+const INK = '#3B312A';
+
+function clamp(v) { return Math.max(-1, Math.min(1, v)); }
+
+export default function BookBuddy({
+  look = null, followPointer = false, mood = 'smile',
+  coverEyes = false, peekThrough = false, waving = false,
+  arms = true, legs = true, className = '',
+}) {
+  const ref = useRef(null);
+  const [pointer, setPointer] = useState({ x: 0, y: 0 });
+
+  // ตามองตามเมาส์ (คำนวณจากตำแหน่งตัวการ์ตูนบนจอ)
+  useEffect(() => {
+    if (!followPointer) return;
+    let frame = 0;
+    function onMove(e) {
+      cancelAnimationFrame(frame);
+      frame = requestAnimationFrame(() => {
+        const r = ref.current?.getBoundingClientRect();
+        if (!r) return;
+        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
+        setPointer({ x: clamp((e.clientX - cx) / (window.innerWidth / 2.5)), y: clamp((e.clientY - cy) / (window.innerHeight / 2.5)) });
+      });
+    }
+    window.addEventListener('pointermove', onMove);
+    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame); };
+  }, [followPointer]);
+
+  const eye = look ?? (followPointer ? pointer : { x: 0, y: 0 });
+  const px = eye.x * 5, py = eye.y * 5;          // รูม่านตาขยับได้ไม่เกิน 5 หน่วย
+  const face = `translate(${eye.x * 2.5}px, ${eye.y * 2}px)`;
+  const armUp = peekThrough ? 112 : 128;         // องศาที่ยกแขนขึ้นปิดตา
+
+  return (
+    <svg ref={ref} viewBox="0 0 200 212" className={'buddy ' + className}
+         aria-hidden="true" focusable="false">
+      {legs && (
+        <g className="buddy-legs">
+          <ellipse cx="100" cy="205" rx="54" ry="6" fill="rgb(0 0 0 / .12)" />
+          <path className="buddy-limb" d="M80 180v16M120 180v16" stroke={INK} strokeWidth="5" strokeLinecap="round" />
+          <ellipse className="buddy-foot" cx="75" cy="199" rx="11" ry="5.5" fill={INK} />
+          <ellipse className="buddy-foot" cx="125" cy="199" rx="11" ry="5.5" fill={INK} />
+        </g>
+      )}
+
+      {/* ที่คั่นหนังสือ */}
+      <path className="buddy-ribbon" d="M124 44V10l7 6 7-6v34z" fill="#7FB3C2" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
+
+      {/* ปกหลังกับหน้ากระดาษ */}
+      <rect x="46" y="38" width="118" height="146" rx="15" fill="#6E4E37" stroke={INK} strokeWidth="3" />
+      <rect x="146" y="44" width="14" height="134" rx="4" fill="#FBF6EC" />
+      <path d="M150 54v114M155 54v114" stroke="#E2D3C0" strokeWidth="1.5" />
+
+      {/* ปกหน้า */}
+      <clipPath id="buddy-cover"><rect x="34" y="30" width="118" height="150" rx="16" /></clipPath>
+      <g clipPath="url(#buddy-cover)">
+        <rect x="34" y="30" width="118" height="150" fill="#B98258" />
+        <rect x="34" y="30" width="17" height="150" fill="#8A6448" />
+        <path d="M51 30v150" stroke="rgb(255 255 255 / .25)" strokeWidth="2" />
+        <path d="M64 46h74M64 166h74" stroke="#E6C07E" strokeWidth="2.5" strokeLinecap="round" />
+        <ellipse cx="120" cy="52" rx="40" ry="18" fill="rgb(255 255 255 / .12)" />
+      </g>
+      <rect x="34" y="30" width="118" height="150" rx="16" fill="none" stroke={INK} strokeWidth="3" />
+
+      {/* หน้า */}
+      <g className="buddy-face" style={{ transform: face }}>
+        <g className={'buddy-brows mood-' + mood}>
+          <path d="M70 80q8-6 16 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
+          <path d="M108 80q8-6 16 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
+        </g>
+        {[78, 116].map(cx => (
+          <g key={cx} className="buddy-eye">
+            <ellipse cx={cx} cy="101" rx="13" ry="15" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
+            <g style={{ transform: `translate(${px}px, ${py}px)`, transition: 'transform .18s ease-out' }}>
+              <circle cx={cx} cy="102" r={mood === 'wow' ? 5.5 : 7} fill="#2A211B" />
+              <circle cx={cx + 2.6} cy="98.5" r="2.4" fill="#FFFFFF" />
+            </g>
+          </g>
+        ))}
+        <ellipse cx="65" cy="124" rx="8" ry="5" fill="#F29C8F" opacity=".6" />
+        <ellipse cx="129" cy="124" rx="8" ry="5" fill="#F29C8F" opacity=".6" />
+        {mood === 'happy' && <path d="M85 122q12 18 24 0z" fill="#7A3328" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />}
+        {mood === 'smile' && <path d="M88 124q9 9 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />}
+        {mood === 'oops' && <path d="M88 130q9-7 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />}
+        {mood === 'wow' && <ellipse cx="97" cy="128" rx="5.5" ry="7" fill="#7A3328" stroke={INK} strokeWidth="2.5" />}
+      </g>
+
+      {arms && (
+        <>
+          <g className="buddy-arm" style={{ transform: `translate(36px, 128px) rotate(${coverEyes ? -armUp : 24}deg)` }}>
+            <path className="buddy-limb" d="M0 0v38" stroke={INK} strokeWidth="5" strokeLinecap="round" />
+            <circle cx="0" cy="46" r="11" fill="#F3D9BC" stroke={INK} strokeWidth="2.5" />
+          </g>
+          <g className={'buddy-arm buddy-arm-r' + (waving && !coverEyes ? ' is-waving' : '')}
+             style={{ transform: `translate(158px, 128px) rotate(${coverEyes ? armUp : -24}deg)` }}>
+            <path className="buddy-limb" d="M0 0v38" stroke={INK} strokeWidth="5" strokeLinecap="round" />
+            <circle cx="0" cy="46" r="11" fill="#F3D9BC" stroke={INK} strokeWidth="2.5" />
+          </g>
+        </>
+      )}
+    </svg>
+  );
+}
diff --git a/src/components/mascot/PeekBuddy.jsx b/src/components/mascot/PeekBuddy.jsx
new file mode 100644
index 0000000..240be99
--- /dev/null
+++ b/src/components/mascot/PeekBuddy.jsx
@@ -0,0 +1,28 @@
+import { useState } from 'react';
+import BookBuddy from './BookBuddy';
+
+// น้องบุ๊คแอบอยู่หลังหนังสือบนชั้น โผล่มาจ๊ะเอ๋เป็นระยะ ชี้หรือแตะแล้วโผล่ค้าง
+// วางไว้ใน element ที่ relative และมีหนังสือ (z-10) บังอยู่ด้านหน้า
+// เป็นของตกแต่ง (aria-hidden) จึงไม่รับโฟกัสคีย์บอร์ด
+function PeekBuddy() {
+  const [pop, setPop] = useState(false);
+  return (
+    <div aria-hidden="true" className={'peek-wrap pointer-events-none absolute inset-0 ' + (pop ? 'is-pop' : '')}>
+      <div className={'peek-buddy pointer-events-auto ' + (pop ? 'is-pop' : '')}
+           onPointerEnter={() => setPop(true)} onPointerLeave={() => setPop(false)}
+           onClick={() => setPop(p => !p)}>
+        <span className="peek-bubble rounded-2xl rounded-br-sm border border-latte-deep/60 bg-white px-3 py-1.5 font-round text-sm text-ink shadow-[0_8px_18px_-10px_rgb(0_0_0/.45)] sm:text-base">
+          {pop ? 'จ๊ะเอ๋! เจอแล้ว' : 'จ๊ะเอ๋!'}
+        </span>
+        <BookBuddy arms={false} legs={false} mood={pop ? 'happy' : 'smile'} look={{ x: -0.5, y: 0.35 }} className="w-full" />
+      </div>
+      {/* มือสองข้างเกาะขอบบนของหนังสือ อยู่หน้าปก */}
+      <span className="peek-hands absolute inset-x-[16%] top-0 z-20 flex -translate-y-1/2 justify-between">
+        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3B312A] bg-[#F3D9BC] sm:h-4 sm:w-4" />
+        <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3B312A] bg-[#F3D9BC] sm:h-4 sm:w-4" />
+      </span>
+    </div>
+  );
+}
+
+export default PeekBuddy;
diff --git a/src/index.css b/src/index.css
index c189a64..b061f91 100644
--- a/src/index.css
+++ b/src/index.css
@@ -2,14 +2,47 @@
 @tailwind components;
 @tailwind utilities;
 
+/* ---------- สีทั้งเว็บ (tailwind.config.js อ่านค่าจากตรงนี้) ค่าเป็น "R G B" ---------- */
+:root {
+  color-scheme: light;
+  --page: 255 255 255;        --surface: 255 255 255;    --paper-shade: 246 247 239;
+  --ink: 59 49 42;            --ink-soft: 107 91 78;     --ink-faint: 119 102 86;
+  --cloth: 138 100 72;        --cloth-dark: 110 78 55;   --cloth-light: 243 235 227;
+  --on-accent: 255 255 255;
+  --gilt: 201 150 95;         --gilt-light: 245 235 221;
+  --line: 232 220 207;
+  --sky: 187 220 229;         --sky-light: 230 242 245;  --sky-deep: 143 191 204;
+  --cream: 251 251 246;       --cream-deep: 236 238 223;
+  --latte: 217 196 176;       --latte-deep: 207 171 141; --wood: 180 138 104;
+  --shadow: 59 49 42;
+  --glow-1: rgba(187, 220, 229, .55); --glow-2: rgba(236, 238, 223, .9); --glow-3: rgba(217, 196, 176, .45);
+}
+/* โหมดมืด: ห้องสมุดตอนกลางคืน พื้นกาแฟเข้ม ตัวอักษรครีม ปุ่มคาราเมลสว่าง */
+.dark {
+  color-scheme: dark;
+  --page: 23 18 15;           --surface: 36 28 23;       --paper-shade: 46 36 29;
+  --ink: 242 232 220;         --ink-soft: 205 187 168;   --ink-faint: 168 147 127;
+  --cloth: 217 167 124;       --cloth-dark: 234 192 152; --cloth-light: 58 44 34;
+  --on-accent: 30 22 17;
+  --gilt: 224 176 116;        --gilt-light: 59 46 31;
+  --line: 74 59 48;
+  --sky: 53 82 91;            --sky-light: 34 52 58;     --sky-deep: 93 140 153;
+  --cream: 23 18 15;          --cream-deep: 42 36 32;
+  --latte: 107 85 68;         --latte-deep: 138 107 84;  --wood: 122 90 67;
+  --shadow: 0 0 0;
+  --glow-1: rgba(93, 140, 153, .22); --glow-2: rgba(122, 90, 67, .18); --glow-3: rgba(217, 167, 124, .12);
+}
+
 body {
-  @apply bg-white text-ink antialiased;
+  @apply text-ink antialiased;
+  background-color: rgb(var(--page));
   background-image:
-    radial-gradient(40rem 40rem at 100% -10%, rgba(187, 220, 229, .55), transparent 70%),
-    radial-gradient(34rem 34rem at -10% 45%, rgba(236, 238, 223, .9), transparent 70%),
-    radial-gradient(36rem 36rem at 110% 95%, rgba(217, 196, 176, .45), transparent 70%);
+    radial-gradient(40rem 40rem at 100% -10%, var(--glow-1), transparent 70%),
+    radial-gradient(34rem 34rem at -10% 45%, var(--glow-2), transparent 70%),
+    radial-gradient(36rem 36rem at 110% 95%, var(--glow-3), transparent 70%);
+  transition: background-color .3s, color .3s;
 }
-::selection { background: #BBDCE5; color: #3B312A; }
+::selection { background: rgb(var(--sky)); color: rgb(var(--ink)); }
 
 /* วงโฟกัสเห็นชัดเวลาใช้คีย์บอร์ด */
 :focus-visible {
@@ -28,11 +61,15 @@ body {
 /* ---------- กระจก (ใช้ทั้งเว็บ) ---------- */
 @layer components {
   .glass {
-    background: rgba(255, 255, 255, .7);
+    background: rgb(var(--surface) / .7);
     -webkit-backdrop-filter: blur(18px) saturate(140%);
     backdrop-filter: blur(18px) saturate(140%);
-    border: 1px solid rgba(180, 138, 104, .32);          /* ขอบน้ำตาลอ่อน ให้แยกจากพื้นหลังขาว */
-    box-shadow: 0 12px 32px -14px rgba(59,49,42, .35), 0 2px 6px -2px rgba(59,49,42, .08), inset 0 1px 0 rgba(255, 255, 255, .9);
+    border: 1px solid rgb(var(--wood) / .32);            /* ขอบน้ำตาลอ่อน ให้แยกจากพื้นหลัง */
+    box-shadow: 0 12px 32px -14px rgb(var(--shadow) / .35), 0 2px 6px -2px rgb(var(--shadow) / .08), inset 0 1px 0 rgb(255 255 255 / .9);
+  }
+  .dark .glass {
+    border-color: rgb(var(--wood) / .55);
+    box-shadow: 0 14px 36px -14px rgb(0 0 0 / .7), inset 0 1px 0 rgb(255 255 255 / .06);
   }
 }
 .warm-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
@@ -42,7 +79,7 @@ body {
 @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
 .floaty { animation: float 6s ease-in-out infinite; }
 @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
-.shimmer { background: linear-gradient(90deg, #F2F3EA 0%, #E8DCCF 45%, #F2F3EA 90%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
+.shimmer { background: linear-gradient(90deg, rgb(var(--paper-shade)) 0%, rgb(var(--line)) 45%, rgb(var(--paper-shade)) 90%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
 
 /* ---------- หนังสือ 3 มิติบนชั้น (components/home/ShelfBook.jsx) ---------- */
 .sb, .shelf-slot { --w: 140px; --d: 26px; }
@@ -73,13 +110,13 @@ body {
   transform: translateX(calc(var(--w) - var(--d) / 2 - 3px)) rotateY(90deg) translateX(calc(var(--d) / 2)); }
 .sb-back { position: absolute; inset: 0; border-radius: 3px 8px 8px 3px; transform: translateZ(calc(-1 * var(--d))); }
 .sb-floor { display: block; width: 78%; height: 18px; margin: -2px auto 0; border-radius: 50%;
-  background: radial-gradient(closest-side, rgba(59,49,42,.32), rgba(59,49,42,0));
+  background: radial-gradient(closest-side, rgb(var(--shadow) / .32), rgb(var(--shadow) / 0));
   transition: transform .6s cubic-bezier(.34, 1.45, .64, 1), opacity .4s; }
 .sb:hover .sb-3d, .sb:focus-visible .sb-3d { transform: rotateY(-12deg) rotateX(4deg) translateY(-18px); }
 .sb:hover .sb-front, .sb:focus-visible .sb-front { transform: rotateY(-34deg); }
 .sb:hover .sb-inner span, .sb:focus-visible .sb-inner span { opacity: 1; }
 .sb:hover .sb-floor, .sb:focus-visible .sb-floor { transform: scale(.78); opacity: .55; }
-.sb:focus-visible { --tw-ring-offset-color: #FFFFFF; }
+.sb:focus-visible { --tw-ring-offset-color: rgb(var(--surface)); }
 
 /* ---------- ชั้นเลื่อน (components/home/BookShelfCarousel.jsx) ---------- */
 @keyframes rise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
@@ -91,15 +128,15 @@ body {
 .shelf-track.is-prev .sb-3d { transform: rotateY(6deg) rotateX(3deg); }
 .shelf-info { margin-top: 14px; text-align: center; transition: transform .4s cubic-bezier(.34, 1.45, .64, 1); }
 .shelf-slot:hover .shelf-info { transform: translateY(-6px); }
-.shelf-slot:hover h3 { color: #8A6448; }
-.shelf-nav { width: 48px; height: 48px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #3B312A;
+.shelf-slot:hover h3 { color: rgb(var(--cloth)); }
+.shelf-nav { width: 48px; height: 48px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: rgb(var(--ink));
   transition: transform .25s cubic-bezier(.34, 1.56, .64, 1), opacity .2s; }
 .shelf-nav:hover:not(:disabled) { transform: scale(1.08); }
 .shelf-nav:active:not(:disabled) { transform: scale(.94); }
 .shelf-nav:disabled { opacity: .4; cursor: default; }
-.shelf-dot { width: 10px; height: 10px; border-radius: 9999px; background: #D9C4B0;
+.shelf-dot { width: 10px; height: 10px; border-radius: 9999px; background: rgb(var(--latte));
   transition: width .45s cubic-bezier(.34, 1.56, .64, 1), background-color .3s; }
-.shelf-dot.is-on { width: 30px; background: #8A6448; }
+.shelf-dot.is-on { width: 30px; background: rgb(var(--cloth)); }
 
 @media (prefers-reduced-motion: reduce) {
   *, *::before, *::after { animation: none !important; transition: none !important; }
@@ -112,3 +149,62 @@ body {
   to   { opacity: 1; transform: translateY(0); }
 }
 .shelf-in { animation: shelf-in .5s ease-out both; }
+
+/* ข้อความแจ้งข้อผิดพลาด (สีแดงของ Tailwind) ให้อ่านออกบนพื้นมืด */
+.dark .text-red-600, .dark .text-red-700, .dark .text-red-800 { color: #F4A79D; }
+.dark .bg-red-50 { background-color: rgb(127 29 29 / .28); }
+.dark .border-red-200, .dark .border-red-300, .dark .border-red-400 { border-color: rgb(248 113 113 / .45); }
+.dark .hover\:bg-red-50:hover, .dark .hover\:bg-red-100:hover { background-color: rgb(127 29 29 / .45); }
+.dark .hover\:text-red-700:hover { color: #F8C1B9; }
+
+/* ปุ่มสลับโหมด */
+.theme-icon { transition: transform .5s cubic-bezier(.34, 1.56, .64, 1), opacity .25s; }
+.theme-icon.is-off { opacity: 0; transform: rotate(-90deg) scale(.4); }
+
+/* ---------- น้องบุ๊ค (components/mascot) ---------- */
+.buddy { overflow: visible; }
+.dark .buddy-limb { stroke: #E9D8C4; }   /* แขนขาสีเข้มจะหายไปบนพื้นมืด */
+.dark .buddy-foot { fill: #E9D8C4; }
+.buddy-arm { transition: transform .45s cubic-bezier(.34, 1.56, .64, 1); }
+.buddy-arm-r.is-waving { animation: buddy-wave .6s ease-in-out 4 alternate; }
+@keyframes buddy-wave {
+  from { transform: translate(158px, 128px) rotate(150deg); }
+  to   { transform: translate(158px, 128px) rotate(110deg); }
+}
+.buddy-face { transition: transform .2s ease-out; }
+.buddy-eye { transform-box: fill-box; transform-origin: center; animation: buddy-blink 4.5s infinite; }
+@keyframes buddy-blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
+.buddy-brows { transition: transform .3s; }
+.buddy-brows.mood-wow { transform: translateY(-5px); }
+.buddy-brows.mood-oops { transform: translateY(2px); }
+.buddy-ribbon { transform-box: fill-box; transform-origin: 50% 100%; animation: buddy-ribbon 3s ease-in-out infinite; }
+@keyframes buddy-ribbon { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
+.bob { animation: bob 3.2s ease-in-out infinite; }
+@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
+
+/* ของลอยไปมาบนเวทีหน้า login / register */
+.drift { position: absolute; animation: drift var(--t, 7s) ease-in-out var(--d, 0s) infinite; }
+@keyframes drift {
+  0%, 100% { transform: translate(0, 0) rotate(var(--r, 0deg)); }
+  50%      { transform: translate(var(--x, 6px), var(--y, -14px)) rotate(calc(var(--r, 0deg) + 12deg)); }
+}
+
+/* หน้าแรก: น้องบุ๊คแอบหลังหนังสือแล้วโผล่มา "จ๊ะเอ๋" */
+.peek-buddy { position: absolute; left: -4%; right: -4%; bottom: 4%; z-index: 0; cursor: pointer;
+  animation: peek 9s cubic-bezier(.34, 1.4, .64, 1) 1.5s infinite; }
+@keyframes peek {
+  0%, 38%   { transform: translateY(0); }
+  46%       { transform: translateY(-114%); }
+  50%, 76%  { transform: translateY(-108%); }
+  84%, 100% { transform: translateY(0); }
+}
+.peek-bubble, .peek-hands { opacity: 0; animation: peek-show 9s ease 1.5s infinite; }
+@keyframes peek-show { 0%, 47% { opacity: 0; } 51%, 75% { opacity: 1; } 79%, 100% { opacity: 0; } }
+.peek-bubble { position: absolute; right: 74%; top: 2%; white-space: nowrap; transform-origin: 100% 100%; }
+.peek-buddy.is-pop { animation: none; transform: translateY(-124%); transition: transform .45s cubic-bezier(.34, 1.56, .64, 1); }
+.peek-buddy.is-pop .peek-bubble { animation: none; opacity: 1; }
+.peek-wrap.is-pop .peek-hands { animation: none; opacity: 1; }
+@media (prefers-reduced-motion: reduce) {
+  .peek-buddy { transform: translateY(-108%); }
+  .peek-bubble, .peek-hands { opacity: 1; }
+}
diff --git a/src/index.js b/src/index.js
index 456d7e2..451bbaa 100644
--- a/src/index.js
+++ b/src/index.js
@@ -3,12 +3,15 @@ import ReactDOM from 'react-dom/client';
 import { BrowserRouter } from 'react-router-dom';
 import './index.css';
 import App from './App';
+import { ThemeProvider } from './theme/ThemeContext';
 
 const root = ReactDOM.createRoot(document.getElementById('root'));
 root.render(
   <React.StrictMode>
-    <BrowserRouter>
-      <App />
-    </BrowserRouter>
+    <ThemeProvider>
+      <BrowserRouter>
+        <App />
+      </BrowserRouter>
+    </ThemeProvider>
   </React.StrictMode>
 );
diff --git a/src/pages/BookDetail.jsx b/src/pages/BookDetail.jsx
index 3bdec5b..c84b993 100644
--- a/src/pages/BookDetail.jsx
+++ b/src/pages/BookDetail.jsx
@@ -119,7 +119,7 @@ function BookDetail() {
         <p className="mt-2 text-sm text-ink-soft">{error?.message}</p>
         <div className="mt-6 flex justify-center gap-4 text-sm">
           <button onClick={() => setReloadBook(k => k + 1)}
-                  className="rounded-md bg-cloth px-4 py-2 font-medium text-white hover:bg-cloth-dark">ลองใหม่</button>
+                  className="rounded-md bg-cloth px-4 py-2 font-medium text-on-accent hover:bg-cloth-dark">ลองใหม่</button>
           <Link to="/books" className="self-center text-cloth hover:underline">กลับไปหน้าหนังสือ</Link>
         </div>
       </div>
@@ -188,7 +188,7 @@ function BookDetail() {
             <div className="flex flex-wrap items-center justify-between gap-3">
               <p className="text-ink-soft">เข้าสู่ระบบเพื่อให้คะแนนและเขียนรีวิวเล่มนี้</p>
               <button onClick={() => navigate('/login', { state: { from: location.pathname, reason: 'review' } })}
-                      className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-white hover:bg-cloth-dark">
+                      className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-on-accent hover:bg-cloth-dark">
                 เข้าสู่ระบบเพื่อรีวิว
               </button>
             </div>
diff --git a/src/pages/Books.jsx b/src/pages/Books.jsx
index 8692b7b..062ae72 100644
--- a/src/pages/Books.jsx
+++ b/src/pages/Books.jsx
@@ -83,7 +83,7 @@ function Books() {
           <input id="books-search" type="search" value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder="ค้นชื่อหนังสือหรือผู้แต่ง"
                  className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 placeholder:text-ink-faint focus:border-cloth focus:outline-none focus:ring-2 focus:ring-cloth/20" />
-          <button type="submit" className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-white hover:bg-cloth-dark">ค้นหา</button>
+          <button type="submit" className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-on-accent hover:bg-cloth-dark">ค้นหา</button>
         </form>
       </div>
 
diff --git a/src/pages/Home.jsx b/src/pages/Home.jsx
index 07fedf3..3fce087 100644
--- a/src/pages/Home.jsx
+++ b/src/pages/Home.jsx
@@ -2,6 +2,7 @@ import { useEffect, useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import BookGrid from '../components/BookGrid';
 import BookCover from '../components/BookCover';
+import PeekBuddy from '../components/mascot/PeekBuddy';
 import BookShelfCarousel from '../components/home/BookShelfCarousel';
 import { listBooks } from '../api/backend';
 import { useCategories } from '../data/categories';
@@ -9,6 +10,7 @@ import { useCategories } from '../data/categories';
 const HERO_SIZE = 5;                                         // ชั้นปกจริงในส่วนหัว (แบบเดิม)
 const SHELF_SIZE = 15;                                       // รวมกับชั้น 3 มิติด้านล่าง
 const HERO_WIDTHS = ['w-[84%]', 'w-full', 'w-[78%]', 'w-[92%]', 'w-[82%]'];
+const PEEK_AT = 3;                                           // น้องบุ๊คแอบหลังเล่มที่ 4 (เห็นทั้งจอมือถือและจอใหญ่)
 
 // เล่มที่มีปกขึ้นชั้นก่อน เล่มไม่มีปกใช้ปกสำรอง
 export function pickShelf(books, size = SHELF_SIZE) {
@@ -73,9 +75,9 @@ function Home() {
 
   return (
     <div className="relative overflow-hidden font-warm text-cocoa">
-      <span aria-hidden="true" className="warm-blob -right-32 -top-40 h-[520px] w-[520px] bg-[#BBDCE5] opacity-75" />
-      <span aria-hidden="true" className="warm-blob -left-40 top-[380px] h-[420px] w-[420px] bg-[#ECEEDF] opacity-90" />
-      <span aria-hidden="true" className="warm-blob -right-36 top-[1200px] h-[460px] w-[460px] bg-[#D9C4B0] opacity-60" />
+      <span aria-hidden="true" className="warm-blob -right-32 -top-40 h-[520px] w-[520px] bg-sky opacity-75 dark:opacity-50" />
+      <span aria-hidden="true" className="warm-blob -left-40 top-[380px] h-[420px] w-[420px] bg-cream-deep opacity-90 dark:opacity-60" />
+      <span aria-hidden="true" className="warm-blob -right-36 top-[1200px] h-[460px] w-[460px] bg-latte opacity-60 dark:opacity-30" />
 
       {/* ส่วนหัว: ข้อความ + ค้นหา ซ้าย / ปกจริงยืนเรียงบนแผ่นไม้ ขวา (เลย์เอาต์เดิม โทนใหม่) */}
       <section className="relative border-b border-latte/70">
@@ -93,7 +95,7 @@ function Home() {
                      placeholder="เช่น Dune หรือ Agatha Christie"
                      className="min-h-12 min-w-0 flex-1 rounded-xl border-0 bg-white/60 px-4 text-base text-cocoa placeholder:text-cocoa-soft/80 focus:outline-none focus:ring-2 focus:ring-caramel/40" />
               <button type="submit"
-                      className="lift min-h-12 rounded-xl bg-caramel px-5 font-semibold text-white shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-caramel-dark">
+                      className="lift min-h-12 rounded-xl bg-caramel px-5 font-semibold text-on-accent shadow-[0_8px_18px_-8px_rgba(138,100,72,.7)] hover:bg-caramel-dark">
                 ค้นหา
               </button>
             </form>
@@ -102,18 +104,21 @@ function Home() {
           <div className="self-end" aria-label="หนังสือแนะนำ">
             <div className="grid grid-cols-4 items-end gap-3 px-2 sm:grid-cols-5 md:gap-5">
               {(hero.length ? hero : Array.from({ length: HERO_SIZE }, (_, i) => ({ id: `ph${i}` }))).map((b, i) => (
-                <Link key={b.id} to={b.title ? `/books/${b.id}` : '/books'}
-                      tabIndex={b.title ? 0 : -1} aria-hidden={b.title ? undefined : true}
-                      className={'shelf-in group mx-auto block ' + HERO_WIDTHS[i] + (i === HERO_SIZE - 1 ? ' hidden sm:block' : '')}
-                      style={{ animationDelay: `${i * 70}ms` }}>
-                  {b.title
-                    ? <BookCover src={b.coverUrl} title={b.title}
-                                 className="origin-bottom transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-2" />
-                    : <div className={'aspect-[2/3] rounded-[3px] ' + (shelfStatus === 'loading' ? 'shimmer' : 'bg-latte/40')} />}
-                </Link>
+                <div key={b.id} className={'relative mx-auto ' + HERO_WIDTHS[i] + (i === HERO_SIZE - 1 ? ' hidden sm:block' : '')}>
+                  {i === PEEK_AT && <PeekBuddy />}
+                  <Link to={b.title ? `/books/${b.id}` : '/books'}
+                        tabIndex={b.title ? 0 : -1} aria-hidden={b.title ? undefined : true}
+                        className="shelf-in group relative z-10 block"
+                        style={{ animationDelay: `${i * 70}ms` }}>
+                    {b.title
+                      ? <BookCover src={b.coverUrl} title={b.title}
+                                   className="origin-bottom transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-2" />
+                      : <div className={'aspect-[2/3] rounded-[3px] ' + (shelfStatus === 'loading' ? 'shimmer' : 'bg-latte/40')} />}
+                  </Link>
+                </div>
               ))}
             </div>
-            <div className="h-3 rounded-t-sm bg-[#B48A68] shadow-[0_6px_10px_-4px_rgba(59,49,42,.45)]" />
+            <div className="h-3 rounded-t-sm bg-caramel-wood shadow-[0_6px_10px_-4px_rgba(59,49,42,.45)]" />
           </div>
         </div>
       </section>
diff --git a/src/pages/Login.jsx b/src/pages/Login.jsx
index 29dc794..ad21974 100644
--- a/src/pages/Login.jsx
+++ b/src/pages/Login.jsx
@@ -2,6 +2,8 @@ import { useState } from 'react';
 import { Link, useLocation, useNavigate } from 'react-router-dom';
 import { useAuth } from '../auth/AuthContext';
 import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';
+import AuthStage from '../components/mascot/AuthStage';
+import PasswordInput from '../components/PasswordInput';
 
 const REASONS = {
   review: 'เข้าสู่ระบบก่อนเขียนรีวิวหรือให้คะแนน',
@@ -12,6 +14,8 @@ const REASONS = {
 function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
+  const [showPassword, setShowPassword] = useState(false);
+  const [focus, setFocus] = useState(null);                   // ช่องที่กำลังพิมพ์ ให้น้องบุ๊คมองตาม
   const [error, setError] = useState(null);
   const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
   const { login, expired } = useAuth();
@@ -33,31 +37,48 @@ function Login() {
     }
   }
 
+  // ท่าทางของน้องบุ๊คตามสิ่งที่ผู้ใช้ทำอยู่
+  let buddy = { mood: 'smile', followPointer: true, waving: true, bubble: 'สวัสดี! กลับมาอ่านต่อกันเถอะ' };
+  if (status === 'submitting') buddy = { mood: 'wow', look: { x: 0, y: -0.8 }, bubble: 'กำลังเปิดประตูห้องสมุด...' };
+  else if (error) buddy = { mood: 'oops', look: { x: 0.6, y: 0.4 }, coverEyes: focus === 'password', peekThrough: showPassword,
+                            bubble: 'อุ๊ย ลองตรวจอีเมลกับรหัสผ่านอีกทีนะ' };
+  else if (focus === 'password') buddy = showPassword
+    ? { mood: 'smile', coverEyes: true, peekThrough: true, bubble: 'แอบดูนิดเดียวนะ' }
+    : { mood: 'smile', coverEyes: true, bubble: 'ไม่แอบดูแน่นอน!' };
+  else if (focus === 'email') buddy = { mood: 'smile', look: { x: 0.2 + Math.min(email.length, 28) / 28 * 0.8, y: 0.5 }, bubble: email ? 'อีเมลนี้ใช่ไหมนะ...' : 'ใส่อีเมลที่สมัครไว้ได้เลย' };
+
   return (
-    <div className="mx-auto max-w-sm px-4 py-16">
-      <h1 className="font-serif text-3xl font-medium text-ink">เข้าสู่ระบบ</h1>
-      {reason && <p className="mt-3 rounded-md bg-gilt-light px-3 py-2 text-sm text-ink" role="status">{reason}</p>}
+    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-14 md:py-16">
+      <AuthStage {...buddy} />
+
+      <div className="w-full max-w-sm justify-self-center">
+        <h1 className="font-serif text-3xl font-medium text-ink">เข้าสู่ระบบ</h1>
+        {reason && <p className="mt-3 rounded-md bg-gilt-light px-3 py-2 text-sm text-ink" role="status">{reason}</p>}
 
-      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
-        <div>
-          <label htmlFor="login-email" className={labelClass}>อีเมล</label>
-          <input id="login-email" type="email" autoComplete="email" value={email}
-                 onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
-        </div>
-        <div>
-          <label htmlFor="login-password" className={labelClass}>รหัสผ่าน</label>
-          <input id="login-password" type="password" autoComplete="current-password" value={password}
-                 onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
-        </div>
-        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
-          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
-        </button>
-        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
-      </form>
+        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
+          <div>
+            <label htmlFor="login-email" className={labelClass}>อีเมล</label>
+            <input id="login-email" type="email" autoComplete="email" value={email}
+                   onChange={(e) => setEmail(e.target.value)} required className={inputClass}
+                   onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
+          </div>
+          <div>
+            <label htmlFor="login-password" className={labelClass}>รหัสผ่าน</label>
+            <PasswordInput id="login-password" autoComplete="current-password" value={password}
+                           onChange={(e) => setPassword(e.target.value)} required
+                           show={showPassword} onToggle={() => setShowPassword(s => !s)}
+                           onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} />
+          </div>
+          <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
+            {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
+          </button>
+          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
+        </form>
 
-      <p className="mt-8 text-sm text-ink-soft">
-        ยังไม่มีบัญชี? <Link to="/register" state={location.state} className="text-cloth hover:underline">สมัครสมาชิก</Link>
-      </p>
+        <p className="mt-8 text-sm text-ink-soft">
+          ยังไม่มีบัญชี? <Link to="/register" state={location.state} className="text-cloth hover:underline">สมัครสมาชิก</Link>
+        </p>
+      </div>
     </div>
   );
 }
diff --git a/src/pages/Login.test.jsx b/src/pages/Login.test.jsx
new file mode 100644
index 0000000..549365d
--- /dev/null
+++ b/src/pages/Login.test.jsx
@@ -0,0 +1,32 @@
+import { render, screen } from '@testing-library/react';
+import userEvent from '@testing-library/user-event';
+import { MemoryRouter } from 'react-router-dom';
+import Login from './Login';
+import { AuthProvider } from '../auth/AuthContext';
+
+jest.mock('../api/backend');
+
+const renderLogin = () => render(<AuthProvider><MemoryRouter initialEntries={['/login']}><Login /></MemoryRouter></AuthProvider>);
+
+test('น้องบุ๊คพูดตามช่องที่กำลังกรอก และปิดตาตอนพิมพ์รหัสผ่าน', async () => {
+  const user = userEvent.setup();
+  renderLogin();
+  expect(screen.getByText('สวัสดี! กลับมาอ่านต่อกันเถอะ')).toBeInTheDocument();
+  await user.click(screen.getByLabelText('อีเมล'));
+  expect(screen.getByText('ใส่อีเมลที่สมัครไว้ได้เลย')).toBeInTheDocument();
+  await user.click(screen.getByLabelText('รหัสผ่าน'));
+  expect(screen.getByText('ไม่แอบดูแน่นอน!')).toBeInTheDocument();
+});
+
+test('ปุ่มแสดงรหัสผ่าน สลับชนิดช่อง และน้องบุ๊คแง้มนิ้วแอบดู', async () => {
+  const user = userEvent.setup();
+  renderLogin();
+  const input = screen.getByLabelText('รหัสผ่าน');
+  await user.click(input);
+  await user.type(input, 'secret123');
+  expect(input).toHaveAttribute('type', 'password');
+  await user.click(screen.getByRole('button', { name: 'แสดงรหัสผ่าน' }));
+  expect(input).toHaveAttribute('type', 'text');
+  expect(input).toHaveFocus();                                  // กดปุ่มแล้วช่องไม่หลุดโฟกัส
+  expect(screen.getByText('แอบดูนิดเดียวนะ')).toBeInTheDocument();
+});
diff --git a/src/pages/Register.jsx b/src/pages/Register.jsx
index 5035022..232321a 100644
--- a/src/pages/Register.jsx
+++ b/src/pages/Register.jsx
@@ -2,6 +2,8 @@ import { useState } from 'react';
 import { Link, useLocation, useNavigate } from 'react-router-dom';
 import { useAuth } from '../auth/AuthContext';
 import { inputClass, labelClass, btnPrimary } from '../components/admin/AdminStates';
+import AuthStage from '../components/mascot/AuthStage';
+import PasswordInput from '../components/PasswordInput';
 
 // โครงเดียวกับหน้า Login ต่างกันแค่ช่องกรอกและฟังก์ชันที่เรียก (เหมือน MovieHub)
 // สมัครใหม่ได้บทบาท member เสมอ (Go ไม่รับ role จากฟอร์ม)
@@ -9,6 +11,8 @@ function Register() {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
+  const [showPassword, setShowPassword] = useState(false);
+  const [focus, setFocus] = useState(null);                  // ช่องที่กำลังพิมพ์ ให้น้องบุ๊คมองตาม
   const [error, setError] = useState(null);
   const [status, setStatus] = useState('typing');
   const { register } = useAuth();
@@ -28,35 +32,57 @@ function Register() {
     }
   }
 
+  // ท่าทางของน้องบุ๊คตามสิ่งที่ผู้ใช้ทำอยู่
+  const lookAtField = (text) => ({ x: 0.2 + Math.min(text.length, 28) / 28 * 0.8, y: 0.5 });
+  const shortName = name.trim().slice(0, 20);
+  let buddy = { mood: 'happy', followPointer: true, waving: true, bubble: 'มาเป็นเพื่อนนักอ่านกันนะ!' };
+  if (status === 'submitting') buddy = { mood: 'wow', look: { x: 0, y: -0.8 }, bubble: 'กำลังทำบัตรสมาชิกให้...' };
+  else if (error) buddy = { mood: 'oops', look: { x: 0.6, y: 0.4 }, coverEyes: focus === 'password', peekThrough: showPassword,
+                            bubble: 'อุ๊ย มีอะไรไม่ถูกนิดหน่อย ดูข้อความใต้ปุ่มนะ' };
+  else if (focus === 'password') buddy = {
+    mood: 'smile', coverEyes: true, peekThrough: showPassword,
+    bubble: password.length >= 8 ? 'รหัสยาวพอแล้ว เยี่ยมเลย!' : showPassword ? 'แอบดูนิดเดียวนะ' : 'ไม่แอบดูแน่นอน! อย่างน้อย 8 ตัวนะ',
+  };
+  else if (focus === 'name') buddy = { mood: 'happy', look: lookAtField(name), bubble: shortName ? `ยินดีที่ได้รู้จัก ${shortName}!` : 'อยากให้เรียกว่าอะไรดี?' };
+  else if (focus === 'email') buddy = { mood: 'smile', look: lookAtField(email), bubble: 'อีเมลนี้ใช้ตอนเข้าสู่ระบบนะ' };
+
   return (
-    <div className="mx-auto max-w-sm px-4 py-16">
-      <h1 className="font-serif text-3xl font-medium text-ink">สมัครสมาชิก</h1>
-      <p className="mt-2 text-sm text-ink-soft">สมาชิกเขียนรีวิว ให้คะแนน และเก็บรายการหนังสือที่อยากอ่านได้</p>
-      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
-        <div>
-          <label htmlFor="reg-name" className={labelClass}>ชื่อที่แสดงในรีวิว</label>
-          <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50}
-                 autoComplete="nickname" className={inputClass} />
-        </div>
-        <div>
-          <label htmlFor="reg-email" className={labelClass}>อีเมล</label>
-          <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
-                 autoComplete="email" className={inputClass} />
-        </div>
-        <div>
-          <label htmlFor="reg-password" className={labelClass}>รหัสผ่าน</label>
-          <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
-                 required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
-          <p className="mt-1 text-xs text-ink-faint">อย่างน้อย 8 ตัวอักษร</p>
-        </div>
-        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
-          {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
-        </button>
-        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
-      </form>
-      <p className="mt-8 text-sm text-ink-soft">
-        มีบัญชีแล้ว? <Link to="/login" state={location.state} className="text-cloth hover:underline">เข้าสู่ระบบ</Link>
-      </p>
+    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-14 md:py-16">
+      <AuthStage {...buddy} />
+
+      <div className="w-full max-w-sm justify-self-center">
+        <h1 className="font-serif text-3xl font-medium text-ink">สมัครสมาชิก</h1>
+        <p className="mt-2 text-sm text-ink-soft">สมาชิกเขียนรีวิว ให้คะแนน และเก็บรายการหนังสือที่อยากอ่านได้</p>
+        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
+          <div>
+            <label htmlFor="reg-name" className={labelClass}>ชื่อที่แสดงในรีวิว</label>
+            <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50}
+                   autoComplete="nickname" className={inputClass}
+                   onFocus={() => setFocus('name')} onBlur={() => setFocus(null)} />
+          </div>
+          <div>
+            <label htmlFor="reg-email" className={labelClass}>อีเมล</label>
+            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
+                   autoComplete="email" className={inputClass}
+                   onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
+          </div>
+          <div>
+            <label htmlFor="reg-password" className={labelClass}>รหัสผ่าน</label>
+            <PasswordInput id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)}
+                           required minLength={8} maxLength={72} autoComplete="new-password"
+                           show={showPassword} onToggle={() => setShowPassword(s => !s)}
+                           onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} />
+            <p className="mt-1 text-xs text-ink-faint">อย่างน้อย 8 ตัวอักษร</p>
+          </div>
+          <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full py-2.5'}>
+            {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
+          </button>
+          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
+        </form>
+        <p className="mt-8 text-sm text-ink-soft">
+          มีบัญชีแล้ว? <Link to="/login" state={location.state} className="text-cloth hover:underline">เข้าสู่ระบบ</Link>
+        </p>
+      </div>
     </div>
   );
 }
diff --git a/src/theme/ThemeContext.jsx b/src/theme/ThemeContext.jsx
new file mode 100644
index 0000000..6d12eda
--- /dev/null
+++ b/src/theme/ThemeContext.jsx
@@ -0,0 +1,35 @@
+import { createContext, useContext, useEffect, useState } from 'react';
+
+// โหมดสว่าง/มืด เก็บใน Context เหมือน AuthContext ทุกคอมโพเนนต์เรียก useTheme() ได้
+// ค่าที่เลือกจำไว้ใน localStorage ถ้ายังไม่เคยเลือก ใช้ตามการตั้งค่าของเครื่อง
+// (public/index.html ใส่ class="dark" ให้ก่อน React โหลด หน้าจอจึงไม่กะพริบขาว)
+const STORAGE_KEY = 'bookreview.theme';
+
+const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
+
+function initialTheme() {
+  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
+}
+
+export function ThemeProvider({ children }) {
+  const [theme, setTheme] = useState(initialTheme);
+
+  useEffect(() => {
+    document.documentElement.classList.toggle('dark', theme === 'dark');
+    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17120F' : '#FBFBF6');
+  }, [theme]);
+
+  function toggleTheme() {
+    setTheme(t => {
+      const next = t === 'dark' ? 'light' : 'dark';
+      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* โหมดส่วนตัวบางเบราว์เซอร์เขียนไม่ได้ ไม่เป็นไร */ }
+      return next;
+    });
+  }
+
+  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
+}
+
+export function useTheme() {
+  return useContext(ThemeContext);
+}
diff --git a/src/theme/ThemeContext.test.jsx b/src/theme/ThemeContext.test.jsx
new file mode 100644
index 0000000..cc46b8a
--- /dev/null
+++ b/src/theme/ThemeContext.test.jsx
@@ -0,0 +1,23 @@
+import { render, screen } from '@testing-library/react';
+import userEvent from '@testing-library/user-event';
+import { ThemeProvider } from './ThemeContext';
+import ThemeToggle from '../components/ThemeToggle';
+
+afterEach(() => { document.documentElement.classList.remove('dark'); localStorage.clear(); });
+
+test('กดปุ่มสลับโหมด ใส่/เอา class dark ออกจาก <html> และจำค่าไว้', async () => {
+  const user = userEvent.setup();
+  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
+  await user.click(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดมืด' }));
+  expect(document.documentElement).toHaveClass('dark');
+  expect(localStorage.getItem('bookreview.theme')).toBe('dark');
+  await user.click(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดสว่าง' }));
+  expect(document.documentElement).not.toHaveClass('dark');
+  expect(localStorage.getItem('bookreview.theme')).toBe('light');
+});
+
+test('เปิดหน้ามาโดยมี class dark อยู่แล้ว (ตั้งจาก index.html) เริ่มที่โหมดมืด', () => {
+  document.documentElement.classList.add('dark');
+  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
+  expect(screen.getByRole('button', { name: 'เปลี่ยนเป็นโหมดสว่าง' })).toBeInTheDocument();
+});
diff --git a/tailwind.config.js b/tailwind.config.js
index c5d3655..a0bee6d 100644
--- a/tailwind.config.js
+++ b/tailwind.config.js
@@ -1,26 +1,34 @@
+// ใช้ตัวแปร CSS แบบ "R G B" เพื่อให้ bg-ink/40 (ความโปร่ง) ยังใช้ได้
+const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;
+
 /** @type {import('tailwindcss').Config} */
 module.exports = {
   content: ['./src/**/*.{js,jsx}'],
+  darkMode: 'class',                                    // <html class="dark"> = โหมดมืด (ThemeContext สลับให้)
   theme: {
     extend: {
       // สีของ Book Review ตาม palette colorhunt BBDCE5 / ECEEDF / D9C4B0 / CFAB8D + ขาว
       // ชื่อโทเคนเดิม (ทุกหน้าใช้อยู่) เปลี่ยนแค่ค่า:
       //   ink = ตัวอักษรน้ำตาลเข้ม, cloth = น้ำตาลแทนเข้ม (ปุ่ม/ลิงก์), gilt = ดาว, paper = ขาว, line = เส้นเบจ, sky = ฟ้าพาสเทล
       // (สีใน palette อ่อนเกินจะใช้เป็นตัวอักษร จึงเพิ่มเฉดเข้มที่มาจาก #CFAB8D ไว้สำหรับตัวอักษรและปุ่ม)
+      // สีทุกตัวอ่านจากตัวแปร CSS ใน index.css (:root = โหมดสว่าง, .dark = โหมดมืด)
+      // หน้าไหนใช้ text-ink / bg-white ฯลฯ ก็เปลี่ยนตามโหมดเองโดยไม่ต้องเขียน dark: ทุกที่
       colors: {
-        white: '#FFFFFF',
-        ink: { DEFAULT: '#3B312A', soft: '#6B5B4E', faint: '#776656' },
-        cloth: { DEFAULT: '#8A6448', dark: '#6E4E37', light: '#F3EBE3' },
-        gilt: { DEFAULT: '#C9965F', light: '#F5EBDD' },
-        paper: { DEFAULT: '#FFFFFF', shade: '#F6F7EF' },
-        line: '#E8DCCF',
-        sky: { DEFAULT: '#BBDCE5', light: '#E6F2F5', deep: '#8FBFCC' },
+        white: c('surface'),                            // พื้นการ์ด/ช่องกรอก (โหมดมืด = น้ำตาลเข้ม)
+        page: c('page'),                                // พื้นหลังทั้งหน้า
+        'on-accent': c('on-accent'),                    // ตัวอักษรบนปุ่มสีน้ำตาล
+        ink: { DEFAULT: c('ink'), soft: c('ink-soft'), faint: c('ink-faint') },
+        cloth: { DEFAULT: c('cloth'), dark: c('cloth-dark'), light: c('cloth-light') },
+        gilt: { DEFAULT: c('gilt'), light: c('gilt-light') },
+        paper: { DEFAULT: c('surface'), shade: c('paper-shade') },
+        line: c('line'),
+        sky: { DEFAULT: c('sky'), light: c('sky-light'), deep: c('sky-deep') },
         // ชื่อที่หน้าแรกใช้
-        cream: { DEFAULT: '#FBFBF6', deep: '#ECEEDF' },
-        latte: { DEFAULT: '#D9C4B0', deep: '#CFAB8D' },
-        caramel: { DEFAULT: '#8A6448', dark: '#6E4E37', wood: '#B48A68' },
-        cocoa: { DEFAULT: '#3B312A', soft: '#6B5B4E' },
-        honey: '#C9965F',
+        cream: { DEFAULT: c('cream'), deep: c('cream-deep') },
+        latte: { DEFAULT: c('latte'), deep: c('latte-deep') },
+        caramel: { DEFAULT: c('cloth'), dark: c('cloth-dark'), wood: c('wood') },
+        cocoa: { DEFAULT: c('ink'), soft: c('ink-soft') },
+        honey: c('gilt'),
       },
       fontFamily: {
         // เนื้อหา: Nunito (อังกฤษ) + Noto Sans Thai Looped (ไทย มีหัว อ่านง่าย) / หัวข้อ: Mitr กลมมน
EOF_PATCH_THEME_MASCOT
if ! git apply --check "$TMP/theme-mascot.patch" 2>"$TMP/err"; then
  echo "แก้ไม่ได้: โค้ดไม่ตรงกับที่สคริปต์คาดไว้ (ต้องรัน apply-supabase-only.sh และ apply-style.sh ก่อน และยังไม่ได้แก้ไฟล์เหล่านี้เอง)"
  sed 's/^/  /' "$TMP/err" | head -20
  echo "ไม่ได้แก้ไฟล์ใดเลย"; exit 1
fi
git apply "$TMP/theme-mascot.patch"
echo "✓ เสร็จ ไฟล์ใหม่: src/theme/, src/components/mascot/, ThemeToggle.jsx, PasswordInput.jsx, Login.test.jsx"
echo "  ตรวจด้วย: git status / git diff   แล้วรัน: npm start (ไม่ได้ commit หรือ push ให้)"
