import { Book } from './Book';

// ตัวอย่างการใช้งาน (ไม่ได้ถูก import ในแอป)
export default function BookDemo() {
  return (
    <div className="flex flex-wrap items-end gap-10 p-10">
      <div className="group"><Book title="ทุกเล่มมีเรื่องเล่า" width={196} /></div>
      <div className="group"><Book title="Sapiens" variant="simple" color="#6E4E37" width={160} textured /></div>
      <div className="group"><Book title="1984" src="https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" width={{ sm: 140, lg: 196 }} /></div>
    </div>
  );
}
