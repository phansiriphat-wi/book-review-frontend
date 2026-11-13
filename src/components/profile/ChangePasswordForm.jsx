import { useEffect, useRef, useState } from 'react';
import { changePassword } from '../../api/backend';
import { labelClass, btnPrimary, btnGhost, Notice } from '../admin/AdminStates';
import PasswordInput from '../PasswordInput';

const FIELDS = [
  { key: 'current', id: 'pw-current', label: 'รหัสผ่านปัจจุบัน', autoComplete: 'current-password' },
  { key: 'next', id: 'pw-new', label: 'รหัสผ่านใหม่', autoComplete: 'new-password', help: 'อย่างน้อย 8 ตัวอักษร' },
  { key: 'confirm', id: 'pw-confirm', label: 'ยืนยันรหัสผ่านใหม่', autoComplete: 'new-password' },
];

// จำนวนไบต์แบบ UTF-8 (bcrypt รับได้ไม่เกิน 72 ไบต์ ภาษาไทย 1 ตัว = 3 ไบต์)
const utf8Bytes = (s) => encodeURIComponent(s).replace(/%[0-9A-F]{2}/gi, 'x').length;

// กติกาเดียวกับฝั่ง Go (validatePassword) และเพิ่มการยืนยันรหัสที่ทำได้แค่หน้าเว็บ
export function validatePasswords({ current, next, confirm }) {
  const errors = {};
  if (!current) errors.current = 'กรุณากรอกรหัสผ่านปัจจุบัน';
  if (!next) errors.next = 'กรุณากรอกรหัสผ่านใหม่';
  else if (Array.from(next).length < 8) errors.next = 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร';
  else if (utf8Bytes(next) > 72) errors.next = 'รหัสผ่านใหม่ยาวเกินไป';
  else if (current && next === current) errors.next = 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน';
  if (!confirm) errors.confirm = 'กรุณายืนยันรหัสผ่านใหม่';
  else if (next && confirm !== next) errors.confirm = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน';
  return errors;
}

const SERVER_FIELD = { WRONG_PASSWORD: 'current', SAME_PASSWORD: 'next', BAD_PASSWORD: 'next', MISSING_FIELDS: 'current' };

// onFocusChange(true/false) ให้หน้าโปรไฟล์สั่งน้องบุ๊คปิดตาตอนพิมพ์รหัส
function ChangePasswordForm({ token, onChanged, onCancel, onFocusChange = () => {} }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => () => onFocusChange(false), [onFocusChange]);   // ปิดฟอร์มแล้วน้องบุ๊คเลิกปิดตา

  function change(key, value) {
    setValues(v => ({ ...v, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const found = validatePasswords(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const data = await changePassword(values.current, values.next, token);
      setValues({ current: '', next: '', confirm: '' });         // ไม่เก็บรหัสค้างไว้ในหน้า
      onChanged(data);
    } catch (err) {
      const field = SERVER_FIELD[err.code];
      if (field) setErrors({ [field]: err.message });
      else setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {FIELDS.map((f, i) => {
        const msg = errors[f.key];
        return (
          <div key={f.key}>
            <label htmlFor={f.id} className={labelClass}>{f.label}</label>
            <PasswordInput id={f.id} ref={i === 0 ? firstRef : undefined} autoComplete={f.autoComplete}
                           value={values[f.key]} onChange={(e) => change(f.key, e.target.value)}
                           show={Boolean(show[f.key])} onToggle={() => setShow(s => ({ ...s, [f.key]: !s[f.key] }))}
                           onFocus={() => onFocusChange(true)} onBlur={() => onFocusChange(false)}
                           aria-invalid={Boolean(msg)} aria-describedby={`${f.id}-help`} />
            <p id={`${f.id}-help`} className={'mt-1 text-xs ' + (msg ? 'text-red-600' : 'text-ink-faint')}>
              {msg ?? f.help ?? ' '}
            </p>
          </div>
        );
      })}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={btnGhost}>ยกเลิก</button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
