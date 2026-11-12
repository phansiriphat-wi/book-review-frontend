import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Book } from '../components/ui/Book';
import BookActions from '../components/BookActions';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { StarDisplay } from '../components/StarRating';
import { useAuth } from '../auth/AuthContext';
import { deleteReview, getBook, getReviews, postReview, updateReview } from '../api/backend';
import { categoryLabel, useCategories } from '../data/categories';


function BookDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, token, user } = useAuth();
  const categories = useCategories();

  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadBook, setReloadBook] = useState(0);
  const [reviews, setReviews] = useState({ items: [], avgRating: null, reviewCount: 0 });
  const [reviewStatus, setReviewStatus] = useState('loading');
  const [reviewError, setReviewError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [reloadReviews, setReloadReviews] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const b = await getBook(id);
        if (!ignore) { setBook(b); setStatus('success'); }
      } catch (err) {
        if (ignore) return;
        setError(err);
        // 404/400 = ไม่มีเล่มนี้หรือลิงก์ผิด, อย่างอื่น (เน็ตหลุด / server ยังไม่ตื่น) ให้ลองใหม่ได้
        setStatus(err.status === 404 || err.status === 400 ? 'notfound' : 'error');
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, reloadBook]);                    // id เปลี่ยน = โหลดเล่มใหม่

  // รีวิวแยก effect: คนละ server พังคนละแบบ รีวิวล่มแล้วหน้าหนังสือยังดูได้
  useEffect(() => {
    let ignore = false;
    setReviewStatus('loading');
    getReviews(id)
      .then(data => { if (!ignore) { setReviews(data); setReviewStatus('success'); } })
      .catch(err => { if (!ignore) { setReviewError(err); setReviewStatus('error'); } });
    return () => { ignore = true; };
  }, [id, reloadReviews]);

  const mine = user ? reviews.items.find(r => r.userId === user.id) : null;
  const hintCategory = location.state?.category || book?.category || undefined;

  async function handleCreate({ rating, comment }) {
    await postReview(id, { rating, comment, category: hintCategory }, token);
    setNotice('บันทึกรีวิวแล้ว ขอบคุณที่แบ่งปัน');
    setReloadReviews(k => k + 1);                      // โหลดใหม่ให้คะแนนเฉลี่ยตรงกับ server
  }

  async function handleUpdate({ rating, comment }) {
    await updateReview(mine.id, { rating, comment }, token);
    setEditing(false);
    setNotice('แก้ไขรีวิวแล้ว');
    setReloadReviews(k => k + 1);
  }

  async function handleDelete() {
    if (!window.confirm('ลบรีวิวของคุณสำหรับเล่มนี้? ย้อนกลับไม่ได้')) return;
    try {
      await deleteReview(mine.id, token);
      setNotice('ลบรีวิวแล้ว');
      setReloadReviews(k => k + 1);
    } catch (err) {
      setNotice(err.message);
    }
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 md:px-6" aria-busy="true">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="aspect-[2/3] w-48 shrink-0 rounded bg-paper-shade md:w-64" />
          <div className="flex-1 space-y-4">
            <div className="h-9 w-2/3 rounded bg-paper-shade" />
            <div className="h-4 w-1/3 rounded bg-paper-shade" />
            <div className="h-32 w-full rounded bg-paper-shade" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-medium text-ink">ไม่พบหนังสือเล่มนี้</h1>
        <p className="mt-2 text-sm text-ink-soft">หนังสืออาจถูกลบออกจากระบบแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Link to="/books" className="mt-6 inline-block text-sm text-cloth hover:underline">กลับไปหน้าหนังสือ</Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center" role="alert">
        <h1 className="font-serif text-2xl font-medium text-ink">โหลดข้อมูลหนังสือไม่สำเร็จ</h1>
        <p className="mt-2 text-sm text-ink-soft">{error?.message}</p>
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <button onClick={() => setReloadBook(k => k + 1)}
            className="rounded-md bg-cloth px-4 py-2 font-medium text-white hover:bg-cloth-dark">ลองใหม่</button>
          <Link to="/books" className="self-center text-cloth hover:underline">กลับไปหน้าหนังสือ</Link>
        </div>
      </div>
    );
  }

  const shownCategory = book.category ? categoryLabel(book.category, categories) : null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <button onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/books'))}
        className="text-sm text-ink-soft hover:text-cloth">
        กลับไปรายการหนังสือ
      </button>

      <div className="mt-6 flex flex-col gap-10 md:flex-row">
        <div className="group w-48 shrink-0 self-start md:w-64">
          <Book src={book.coverUrl} title={book.title} size="lg" textured />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl font-medium leading-tight text-ink md:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-ink-soft">{book.author}</p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {book.publishedYear && (
              <div><dt className="inline text-ink-faint">พิมพ์ครั้งแรก </dt><dd className="inline text-ink">{book.publishedYear}</dd></div>
            )}
            {shownCategory && (
              <div><dt className="inline text-ink-faint">หมวด </dt>
                <dd className="inline"><Link to={`/books?category=${encodeURIComponent(book.category)}`} className="text-cloth hover:underline">{shownCategory}</Link></dd>
              </div>
            )}
            {book.openlibraryKey && (
              <div><dt className="sr-only">แหล่งข้อมูล</dt>
                <dd><a href={`https://openlibrary.org/works/${book.openlibraryKey}`} target="_blank" rel="noreferrer"
                  className="text-ink-soft underline hover:text-cloth">ดูใน Open Library</a></dd>
              </div>
            )}
          </dl>

          <div className="mt-5">
            {reviewStatus === 'success' && <StarDisplay value={reviews.avgRating} count={reviews.reviewCount} size="lg" />}
          </div>

          <div className="mt-6">
            <BookActions bookRef={id} category={hintCategory} />
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-lg font-semibold text-ink">เรื่องย่อ</h2>
            <p className="mt-2 max-w-prose whitespace-pre-line leading-loose text-ink-soft">
              {book.description || 'ยังไม่มีเรื่องย่อของเล่มนี้'}
            </p>
          </section>
        </div>
      </div>

      <section className="mt-14 border-t border-line pt-10" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="font-serif text-2xl font-medium text-ink">
          รีวิวจากสมาชิก {reviewStatus === 'success' && <span className="font-sans text-base font-normal text-ink-faint">({reviews.reviewCount})</span>}
        </h2>

        {notice && <p className="mt-4 rounded-md border border-cloth/30 bg-cloth-light px-4 py-3 text-sm text-cloth-dark" role="status">{notice}</p>}

        <div className="mt-6 rounded-lg bg-paper-shade p-5 md:p-6">
          {!isLoggedIn ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-soft">เข้าสู่ระบบเพื่อให้คะแนนและเขียนรีวิวเล่มนี้</p>
              <button onClick={() => navigate('/login', { state: { from: location.pathname, reason: 'review' } })}
                className="rounded-md bg-cloth px-4 py-2 text-sm font-medium text-white hover:bg-cloth-dark">
                เข้าสู่ระบบเพื่อรีวิว
              </button>
            </div>
          ) : reviewStatus === 'loading' ? (
            <p className="text-sm text-ink-faint">กำลังโหลดรีวิว...</p>
          ) : reviewStatus === 'error' ? (
            <p className="text-sm text-red-700" role="alert">โหลดรีวิวไม่สำเร็จ: {reviewError?.message}</p>
          ) : mine && !editing ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium text-ink">รีวิวของคุณ</h3>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => { setEditing(true); setNotice(null); }} className="text-cloth hover:underline">แก้ไข</button>
                  <button onClick={handleDelete} className="text-red-700 hover:underline">ลบ</button>
                </div>
              </div>
              <div className="mt-2"><StarDisplay value={mine.rating} /></div>
              <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed text-ink">{mine.comment}</p>
            </div>
          ) : (
            <>
              <h3 className="mb-3 font-medium text-ink">{mine ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิว'}</h3>
              <ReviewForm key={mine?.id ?? 'new'} bookTitle={book.title}
                initial={mine ?? undefined}
                submitLabel={mine ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}
                onSubmit={mine ? handleUpdate : handleCreate}
                onCancel={mine ? () => setEditing(false) : undefined} />
            </>
          )}
        </div>

        <div className="mt-6">
          {reviewStatus === 'success' && <ReviewList items={reviews.items} excludeUserId={user?.id} />}
          {reviewStatus === 'error' && !isLoggedIn && (
            <p className="text-sm text-red-700" role="alert">โหลดรีวิวไม่สำเร็จ: {reviewError?.message}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default BookDetail;
