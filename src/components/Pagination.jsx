// แบ่งหน้า: ปุ่มก่อนหน้า/ถัดไป + บอกว่าอยู่หน้าไหนจากทั้งหมดกี่หน้า
// maxPages กันหน้ามากเกินจริง (Open Library บอกผลลัพธ์เป็นหมื่นได้)
function Pagination({ page, total, pageSize, onChange, maxPages = 100 }) {
  const pages = Math.min(Math.ceil(total / pageSize), maxPages);
  if (pages <= 1) return null;

  const btn = 'rounded-md border border-line bg-white px-4 py-2 text-sm text-ink hover:border-cloth hover:text-cloth disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink';
  return (
    <nav className="mt-10 flex items-center justify-between gap-4" aria-label="แบ่งหน้า">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>ก่อนหน้า</button>
      <span className="text-sm text-ink-soft">หน้า {page} จาก {pages.toLocaleString('th-TH')}</span>
      <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>ถัดไป</button>
    </nav>
  );
}

export default Pagination;
