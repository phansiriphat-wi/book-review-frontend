import { useEffect, useRef, useState } from 'react';
import { updateProfile } from '../../api/backend';
import { inputClass, labelClass, btnPrimary, btnGhost, Notice } from '../admin/AdminStates';

const MAX_NAME = 50;   // ตรงกับ users.name VARCHAR(50) และ validateName ฝั่ง Go

export function validateName(name) {
  const n = name.trim();
  if (!n) return 'กรุณากรอกชื่อที่แสดง';
  if (Array.from(n).length > MAX_NAME) return `ชื่อยาวได้ไม่เกิน ${MAX_NAME} ตัวอักษร`;
  return null;
}

// แก้ได้เฉพาะชื่อที่แสดงในรีวิว อีเมลแสดงอย่างเดียว บทบาทและเลขผู้ใช้ไม่มีในฟอร์มเลย
function EditProfileForm({ me, token, onSaved, onCancel }) {
  const [name, setName] = useState(me.name);
  const [fieldError, setFieldError] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const unchanged = name.trim() === me.name;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const problem = validateName(name);
    setFieldError(problem);
    if (problem || unchanged) return;
    setSaving(true);
    try {
      const user = await updateProfile(name.trim(), token);
      onSaved(user);
    } catch (err) {
      if (err.code === 'BAD_NAME') setFieldError(err.message);
      else setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="profile-name" className={labelClass}>ชื่อที่แสดง</label>
        <input id="profile-name" ref={nameRef} value={name} maxLength={MAX_NAME + 10}
               onChange={(e) => { setName(e.target.value); setFieldError(null); }}
               aria-invalid={Boolean(fieldError)} aria-describedby="profile-name-help"
               className={inputClass + (fieldError ? ' border-red-400' : '')} />
        <p id="profile-name-help" className={'mt-1 text-xs ' + (fieldError ? 'text-red-600' : 'text-ink-faint')}>
          {fieldError ?? `ชื่อนี้จะแสดงในรีวิวทุกเล่มของคุณ (${Array.from(name.trim()).length}/${MAX_NAME})`}
        </p>
      </div>
      <div>
        <label htmlFor="profile-email" className={labelClass}>อีเมล</label>
        <input id="profile-email" value={me.email} readOnly disabled aria-describedby="profile-email-help" className={inputClass} />
        <p id="profile-email-help" className="mt-1 text-xs text-ink-faint">อีเมลใช้เข้าสู่ระบบ จึงเปลี่ยนเองไม่ได้</p>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving || unchanged} className={btnPrimary}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={btnGhost}>ยกเลิก</button>
      </div>
    </form>
  );
}

export default EditProfileForm;
