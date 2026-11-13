import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/backend';

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
  const [expired, setExpired] = useState(false);  

  function remember({ token, user }) {
    setToken(token);
    setUser(user);
    setExpired(false);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // หน้าโปรไฟล์แก้ชื่อสำเร็จ: เปลี่ยนชื่อบน navbar ทันทีโดยไม่ต้อง login ใหม่
  // เก็บเฉพาะช่องเดิม (บทบาทมาจาก server ไม่ได้มาจากฟอร์ม)
  function updateUser(next) {
    const slim = { id: next.id, name: next.name, email: next.email, role: next.role };
    setUser(slim);
    localStorage.setItem(USER_KEY, JSON.stringify(slim));
  }

  // เปลี่ยนรหัสผ่านสำเร็จ: Go ออกตั๋วใบใหม่ให้ ใช้ใบใหม่ต่อเลย
  function replaceSession({ token, user }) {
    remember({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }

  async function login(email, password) {
    const data = await api.login(email, password);  
    remember(data);
  }

  async function register(name, email, password) {
    await api.register(name, email, password);
    await login(email, password);   
  }

  function logout() {
    forget(setToken, setUser);
  }

  useEffect(() => {
    function onUnauthorized() {
      forget(setToken, setUser);
      setExpired(true);
    }
    window.addEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(api.UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const isAdmin = user?.role === 'admin';
  const value = { token, user, isLoggedIn: Boolean(token), isAdmin, expired, login, register, logout, updateUser, replaceSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  return useContext(AuthContext);
}
