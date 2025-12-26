import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { BiMenu } from 'react-icons/bi';
import {jwtDecode} from 'jwt-decode'; 

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error('Invalid token:', err);
        setIsAuthenticated(false);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleStickyHeader = () => {
    window.addEventListener('scroll', () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add('sticky__header');
      } else {
        headerRef.current.classList.remove('sticky__header');
      }
    });
  };

  useEffect(() => {
    handleStickyHeader();
    return () => window.removeEventListener('scroll', handleStickyHeader);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle('show__menu');

  const getDashboardPathByRole = () => {
    switch (role) {
      case 'patient':
        return '/dashboard/patient';
      case 'doctor':
        return '/dashboard/doctor';
      case 'donor':
        return '/dashboard/donor';
      case 'ambulance_driver':
        return '/dashboard/driver';
      default:
        return null;
    }
  };

  // ✅ Dynamic nav links based on authentication - ONLY show in middle navbar
  const navLinks = isAuthenticated
    ? [
        { path: '/home', display: 'Home' },
        ...(role && role !== 'admin'
          ? [
              { path: getDashboardPathByRole(), display: 'Dashboard' },
              ...(role === 'patient' ? [{ path: '/prescriptions', display: 'Prescriptions' }] : [])
            ]
          : role === 'admin'
          ? [{ path: '/admin-dashboard', display: 'Admin Dashboard' }]
          : []),
        { path: '/account', display: 'Account' }
      ]
    : [
        { path: '/home', display: 'Home' }
        // Login/Signup removed from middle - only show as buttons on right
      ];

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>

          {/* Navigation */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu flex items-center gap-[2.5rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'text-primaryColor text-[16px] leading-7 font-[600]'
                        : 'text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor'
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  localStorage.removeItem('user');
                  setIsAuthenticated(false);
                  setRole(null);
                  window.dispatchEvent(new Event('authChange'));
                  navigate('/');
                }}
                className="bg-primaryColor text-white px-6 py-2 font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-opacity-80 transition-all duration-300 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primaryColor border-2 border-primaryColor px-6 py-2 font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-primaryColor hover:text-white transition-all duration-300 ease-in-out"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-primaryColor text-white px-6 py-2 font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-opacity-80 transition-all duration-300 ease-in-out"
                >
                  Sign Up
                </button>
              </div>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
