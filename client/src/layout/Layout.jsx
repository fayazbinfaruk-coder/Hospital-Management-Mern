import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Public pages (no authentication required)
  const publicPaths = ['/', '/home', '/login', '/signup', '/forgot-password'];
  
  // Show header on home page (public) or when user is logged in
  const shouldShowHeader = publicPaths.includes(location.pathname) || token;
  
  // Show footer on all pages except login/signup/forgot-password
  const shouldShowFooter = !['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowHeader && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default Layout;
