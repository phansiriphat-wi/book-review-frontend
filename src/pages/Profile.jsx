import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMe } from '../api/backend';
import { ErrorBox, Notice, btnGhost, btnPrimary, dateTH } from '../components/admin/AdminStates';
import Avatar from '../components/profile/Avatar';
import EditProfileForm from '../components/profile/EditProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import MyReviews from '../components/profile/MyReviews';
import BookBuddy from '../components/mascot/BookBuddy';

const ROLE = {
  admin: { label: 'Admin', th: 'ผู้ดูแลระบบ', cls: 'border-gilt/50 bg-gilt-light text-ink' },
  member: { label: 'Member', th: 'สมาชิก', cls: 'border-cloth/30 bg-cloth-light text-cloth-dark' },
};

// หน้าโปรไฟล์ (/me ครอบด้วย ProtectedRoute)  ข้อมูลทั้งหมดมาจาก Go: GET /api/auth/me และ GET /api/me/reviews
function Profile() {
  const { token, logout, updateUser, replaceSession } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [panel, setPanel] = useState(null);             // null | 'edit' | 'password'
  const [notice, setNotice] = useState(null);
  const [typingPassword, setTypingPassword] = useState(false);
  const [summary, setSummary] = useState(null);         // { total, avgRating } จากรายการรีวิว

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getMe(token)
      .then(u => { if (!ignore) { setMe(u); setStatus('success'); } })
      .catch(err => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
    // token เปลี่ยนตอนเปลี่ยนรหัสผ่าน (ได้ตั๋วใบใหม่) ไม่ต้องโหลดโปรไฟล์ซ้ำ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const handleSummary = useCallback(s => setSummary(s), []);

  function openPanel(name) {
    setNotice(null);
    setPanel(p => (p === name ? null : name));
  }

  function handleSaved(user) {
    setMe(m => ({ ...m, ...user }));                    // หัวโปรไฟล์เปลี่ยนทันที
    updateUser(user);                                   // ชื่อบน navbar เปลี่ยนด้วย
    setPanel(null);
    setNotice('บันทึกชื่อใหม่แล้ว');
  }

  function handlePasswordChanged(data) {
    replaceSession(data);                               // ใช้ตั๋วใบใหม่จาก Go ต่อได้เลย ไม่ต้อง login ใหม่
    setPanel(null);
    setTypingPassword(false);
    setNotice('เปลี่ยนรหัสผ่านเรียบร้อย ครั้งหน้าเข้าสู่ระบบด้วยรหัสผ่านใหม่');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10" aria-busy="true">
        <p className="sr-only">กำลังโหลดโปรไฟล์...</p>
        <div className="glass flex items-center gap-6 rounded-[28px] p-6 md:p-8">
          <div className="shimmer h-24 w-24 rounded-[28px] md:h-28 md:w-28" />
          <div className="flex-1 space-y-3">
            <div className="shimmer h-7 w-48 rounded" />
            <div className="shimmer h-4 w-64 max-w-full rounded" />
            <div className="shimmer h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />
      </div>
    );
  }

  const role = ROLE[me.role] ?? ROLE.member;
  const reviewCount = summary?.total ?? me.reviewCount ?? 0;
  const firstName = Array.from(me.name).slice(0, 16).join('');

  // ท่าทางของน้องบุ๊คตามสิ่งที่ผู้ใช้ทำอยู่
  let buddy = reviewCount > 0
    ? { mood: 'happy', bubble: `รีวิวไปแล้ว ${reviewCount} เล่ม เก่งมาก ${firstName}!` }
    : { mood: 'smile', bubble: `สวัสดี ${firstName}! ลองเขียนรีวิวเล่มแรกกันไหม` };
  if (typingPassword) buddy = { mood: 'smile', coverEyes: true, bubble: 'ไม่แอบดูนะ ตั้งรหัสใหม่ได้เลย' };
  else if (panel === 'edit') buddy = { mood: 'wow', look: { x: -0.6, y: 0.6 }, bubble: 'อยากให้เรียกว่าอะไรดี?' };
  else if (panel === 'password') buddy = { mood: 'smile', look: { x: -0.6, y: 0.6 }, bubble: 'รหัสใหม่ต้องยาว 8 ตัวขึ้นไปนะ' };
  else if (notice) buddy = { mood: 'happy', waving: true, bubble: 'เรียบร้อยแล้ว!' };

  const stats = [
    { label: 'รีวิวทั้งหมด', value: reviewCount.toLocaleString('th-TH'), unit: 'เล่ม' },
    { label: 'คะแนนเฉลี่ยที่ให้', value: summary ? (summary.avgRating ?? '-') : '…', unit: summary?.avgRating ? 'จาก 5 ดาว' : '' },
    { label: 'รายการอยากอ่าน', value: (me.wishlistCount ?? 0).toLocaleString('th-TH'), unit: 'เล่ม', to: '/me/wishlist' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="sr-only">โปรไฟล์ของฉัน</h1>

      {/* หัวโปรไฟล์ */}
      <section aria-labelledby="profile-name-heading" className="glass relative overflow-hidden rounded-[28px] p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={me.name} id={me.id} className="h-24 w-24 text-4xl md:h-28 md:w-28 md:text-5xl" />
          <div className="min-w-0 flex-1">
            <h2 id="profile-name-heading" className="break-words font-serif text-3xl font-medium text-ink md:text-4xl">{me.name}</h2>
            <p className="mt-1 break-all text-ink-soft">{me.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className={'rounded-full border px-3 py-0.5 font-medium ' + role.cls}>
                {role.label} <span className="font-normal opacity-80">· {role.th}</span>
              </span>
              {me.createdAt && <span className="text-ink-faint">สมาชิกตั้งแต่ {dateTH(me.createdAt)}</span>}
            </div>
          </div>
          {/* น้องบุ๊ค (ของตกแต่ง ข้อความสำคัญอยู่ในหน้าแล้ว) */}
          <div aria-hidden="true" className="hidden shrink-0 flex-col items-center sm:flex">
            <p className="relative max-w-[13rem] rounded-2xl border border-latte-deep/50 bg-white px-3 py-1.5 text-center font-round text-sm leading-snug text-ink shadow-sm">
              {buddy.bubble}
              <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-latte-deep/50 bg-white" />
            </p>
            <BookBuddy {...buddy} bubble={undefined} className="bob mt-2 w-24 md:w-28" />
          </div>
          {/* มือถือ: น้องบุ๊คตัวเล็กมุมขวาบน ไม่มีกล่องคำพูด */}
          <BookBuddy {...buddy} bubble={undefined} className="bob absolute right-5 top-6 w-16 sm:hidden" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          <button onClick={() => openPanel('edit')} aria-expanded={panel === 'edit'} aria-controls="profile-panel"
                  className={panel === 'edit' ? btnPrimary : btnGhost}>แก้ไขโปรไฟล์</button>
          <button onClick={() => openPanel('password')} aria-expanded={panel === 'password'} aria-controls="profile-panel"
                  className={panel === 'password' ? btnPrimary : btnGhost}>เปลี่ยนรหัสผ่าน</button>
          {me.role === 'admin' && <Link to="/admin" className={btnGhost}>หลังบ้าน</Link>}
          <button onClick={handleLogout} className={btnGhost + ' sm:ml-auto'}>ออกจากระบบ</button>
        </div>
      </section>

      <div aria-live="polite" className="mt-4 empty:hidden">{notice && <Notice>{notice}</Notice>}</div>

      {panel && (
        <section id="profile-panel" aria-labelledby="profile-panel-title"
                 className="mt-4 rounded-[24px] border border-latte-deep/50 bg-white p-6 shadow-[0_14px_30px_-22px_rgb(var(--shadow)/.6)] md:p-8">
          <div className="max-w-md">
            <h2 id="profile-panel-title" className="font-serif text-xl font-medium text-ink">
              {panel === 'edit' ? 'แก้ไขโปรไฟล์' : 'เปลี่ยนรหัสผ่าน'}
            </h2>
            <div className="mt-5">
              {panel === 'edit'
                ? <EditProfileForm me={me} token={token} onSaved={handleSaved} onCancel={() => setPanel(null)} />
                : <ChangePasswordForm token={token} onChanged={handlePasswordChanged}
                                      onCancel={() => setPanel(null)} onFocusChange={setTypingPassword} />}
            </div>
          </div>
        </section>
      )}

      {/* การ์ดสถิติ */}
      <section aria-label="กิจกรรมของฉัน" className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(s => {
          const body = (
            <>
              <p className="text-xs leading-snug text-ink-soft sm:text-sm">{s.label}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="font-serif text-2xl font-medium text-ink sm:text-4xl">{s.value}</span>
                {s.unit && <span className="text-xs text-ink-faint sm:text-sm">{s.unit}</span>}
              </p>
            </>
          );
          const cls = 'block rounded-[18px] border border-latte-deep/50 bg-white p-3 sm:rounded-[22px] sm:p-5 shadow-[0_10px_24px_-18px_rgb(var(--shadow)/.6)]';
          return s.to
            ? <Link key={s.label} to={s.to} className={cls + ' lift hover:border-cloth'}>{body}</Link>
            : <div key={s.label} className={cls}>{body}</div>;
        })}
      </section>

      {/* รีวิวของฉัน */}
      <section aria-labelledby="my-reviews-title" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 id="my-reviews-title" className="font-serif text-2xl font-medium text-ink">รีวิวของฉัน</h2>
          <Link to="/books" className="text-sm text-cloth hover:underline">หาหนังสือรีวิวเพิ่ม</Link>
        </div>
        <div className="mt-5">
          <MyReviews token={token} onSummary={handleSummary} />
        </div>
      </section>
    </div>
  );
}

export default Profile;
