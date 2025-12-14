import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { BiMenu } from 'react-icons/bi';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
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

  // ✅ Dynamic nav links
  const navLinks = [
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
            <Link to="/">
              <button className="bg-primaryColor text-white px-6 py-2 font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-opacity-80 transition-all duration-300 ease-in-out">
                Logout
              </button>
            </Link>

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
