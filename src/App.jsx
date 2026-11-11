import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminReviews from './pages/admin/AdminReviews';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    // AuthProvider ครอบทั้งแอป ทุกหน้าข้างในจึงเรียก useAuth() ได้
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            {/* :id = เลขในระบบ หรือรหัส Open Library (OL…W) */}
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/me" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/me/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            {/* หลังบ้าน: ครอบทั้งกิ่งด้วย RequireRole ครั้งเดียว หน้าลูกทุกหน้าได้รับการป้องกันหมด */}
            <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="books/new" element={<AdminBookForm />} />
              <Route path="books/:id" element={<AdminBookForm />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
