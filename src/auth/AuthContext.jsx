import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/backend';

// Context = "กล่องกลาง" ที่ component ไหนในแอปก็เอื้อมมาหยิบได้ (แนวเดียวกับ MovieHub)
const AuthContext = createContext(null);

const TOKEN_KEY = 'bookreview.token';
const USER_KEY = 'bookreview.user';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function forget(setToken, setUser) {
  setToken(null);
  setUser(null);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  // อ่านค่าเดิมจาก localStorage จะได้ไม่หลุด login ตอน refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readUser);
  const [expired, setExpired] = useState(false);       // true เมื่อหลุดเพราะตั๋วหมดอายุ (หน้า Login แสดงข้อความ)

  function remember({ token, user }) {
    setToken(token);
    setUser(user);
    setExpired(false);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function login(email, password) {
    const data = await api.login(email, password);      // ถ้าผิด backend.js จะ throw
    remember(data);
  }

  async function register(name, email, password) {
    await api.register(name, email, password);
    await login(email, password);                       // สมัครเสร็จล็อกอินให้เลย
  }

  function logout() {
    forget(setToken, setUser);
  }

  // Go ตอบ 401 ทั้งที่แนบตั๋วไป = ตั๋วหมดอายุ (อายุ 1 ชั่วโมง) ให้ออกจากระบบทันที
  useEffect(() => {
    function onUnauthorized() {
      forget(setToken, setUser);
      setExpired(true);
    }
    window.addEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const isAdmin = user?.role === 'admin';
  const value = { token, user, isLoggedIn: Boolean(token), isAdmin, expired, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook สั้น ๆ ให้ทุกหน้าเรียก useAuth() แทนที่จะต้อง import Context เอง
export function useAuth() {
  return useContext(AuthContext);
}
