import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-20 border-t border-line/80 bg-white/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          <span className="font-serif font-medium text-ink">Book Review</span> 
          <center>โปรเจกต์ประกอบวิชา 520 341 Client Side Web Programming</center>
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/about" className="hover:text-cloth">เกี่ยวกับเว็บนี้</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
