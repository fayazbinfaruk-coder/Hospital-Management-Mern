import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const hideHeaderPaths = ['/', '/login', '/signup', '/forgot-password'];
  
  const shouldShowHeader = token && !hideHeaderPaths.includes(location.pathname);
  const shouldShowFooter = !['/','/login', '/signup', '/forgot-password'].includes(location.pathname);


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
