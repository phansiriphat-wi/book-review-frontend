function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-serif text-3xl font-bold text-ink">เกี่ยวกับ Book Review</h1>
      <div className="mt-6 space-y-4 leading-loose text-ink-soft">
        <p>
          เว็บรีวิวหนังสือ โปรเจกต์ประกอบวิชา 520 341 Client Side Web Programming พัฒนาต่อจากโครงสร้าง MovieHub
          ด้วย React, React Router และ Tailwind CSS ฝั่งหน้าเว็บ และ Go กับ PostgreSQL (Supabase) ฝั่ง backend
        </p>
        <p>
          ข้อมูลหนังสือ ชื่อผู้แต่ง เรื่องย่อ และรูปปก มาจาก{' '}
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer" className="text-cloth underline">Open Library</a>{' '}
          ส่วนรีวิว คะแนน และรายการอยากอ่าน เป็นข้อมูลของสมาชิกเว็บนี้
        </p>
      </div>
    </div>
  );
}

export default About;
