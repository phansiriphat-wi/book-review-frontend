import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="font-serif text-5xl font-medium text-line">404</p>
      <h1 className="mt-3 text-lg font-medium text-ink">ไม่พบหน้าที่คุณกำลังหา</h1>
      <Link to="/" className="mt-5 inline-block text-sm text-cloth hover:underline">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
