function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-serif text-3xl font-medium text-ink">About</h1>
      <div className="mt-6 space-y-4 leading-loose text-ink-soft">
        <p>
          ผู้จัดทำ : วิศรุตา เอกดำรงกิจ 670710737 , สุจิรา พลอยสำลี 670710743<br></br>
          โปรเจกต์วิชา 520 341 Client Side Web Programming & Server Side Web Programming

          
        </p>
        <p>
          ข้อมูลหนังสือทั้งหมดมาจาก{' '}
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer" className="text-cloth underline">Open Library</a>{' '}
          ส่วนรีวิว คะแนน และรายการอยากอ่าน เป็นข้อมูลของสมาชิกเว็บนี้
        </p>
      </div>
    </div>
  );
}

export default About;
