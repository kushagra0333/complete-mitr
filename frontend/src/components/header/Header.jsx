import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo-2.png';
import './header.css';

const NoHeaderPath = () => ['/login', '/signup', '/forgot-password'];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('mitr-token');
  const user = JSON.parse(localStorage.getItem('mitr-user'));

  if (NoHeaderPath().includes(location.pathname)) return null;

  const handleLogout = () => {
    localStorage.removeItem('mitr-token');
    localStorage.removeItem('mitr-user');
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <div className="nav-main">
      <header className="butter-navbar">
        <div className="navbar-container">
          <Link to="/" className="logo-area">
            <img src={Logo} alt="MITR Logo" className="logo-img" />
            <h4 className="logo-text">MITR</h4>
          </Link>

          <nav className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link>
                <span className="user-greeting">Hi, {user?.userID || 'User'}</span>
                <button onClick={handleLogout} className="outline-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="outline-btn">Login</Link>
                <Link to="/signup" className="glow-btn">Signup</Link>
              </>
            )}
          </nav>

          <div className="hamburger" onClick={() => setMenuOpen(true)}>☰</div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-header">
          <span>Menu</span>
          <span className="close" onClick={() => setMenuOpen(false)}>✕</span>
        </div>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
            <div className="mobile-user-info">Logged in as: {user?.userID || 'User'}</div>
            <button onClick={handleLogout} className="mobile-logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="glow-btn">Signup</Link>
          </>
        )}
      </div>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}

export default Header;