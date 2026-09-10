import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import './Navigation.css';

export default function Navigation() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : 'navbar-transparent'} ${isMobileMenuOpen ? 'navbar-open' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <img src="/auronix-logo.svg" alt="Auronix" className="nav-logo-img" />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-menu desktop-menu">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/services" className="nav-link">
                Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className="nav-link">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/team" className="nav-link">
                Team
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/portfolio" className="nav-link">
                Portfolio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/blog" className="nav-link">
                Blog
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/estimator" className="nav-link">
                Estimator
              </NavLink>
            </li>
            <li className="nav-item">
              <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? (
                  <Sun className="theme-icon sun-icon" />
                ) : (
                  <Moon className="theme-icon moon-icon" />
                )}
              </button>
            </li>
            <li className="nav-item">
              <NavLink to="/contact" className="nav-link nav-link-cta">
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Mobile Navigation Controls */}
          <div className="mobile-controls">
            <button className="theme-toggle-btn mobile-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <Sun className="theme-icon sun-icon" />
              ) : (
                <Moon className="theme-icon moon-icon" />
              )}
            </button>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Immersive Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav-links">
            <li style={{ '--index': 1 }}>
              <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu} end>
                Home
              </NavLink>
            </li>
            <li style={{ '--index': 2 }}>
              <NavLink to="/services" className="mobile-nav-link" onClick={closeMobileMenu}>
                Services
              </NavLink>
            </li>
            <li style={{ '--index': 3 }}>
              <NavLink to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                About
              </NavLink>
            </li>
            <li style={{ '--index': 4 }}>
              <NavLink to="/team" className="mobile-nav-link" onClick={closeMobileMenu}>
                Team
              </NavLink>
            </li>
            <li style={{ '--index': 5 }}>
              <NavLink to="/portfolio" className="mobile-nav-link" onClick={closeMobileMenu}>
                Portfolio
              </NavLink>
            </li>
            <li style={{ '--index': 6 }}>
              <NavLink to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
                Blog
              </NavLink>
            </li>
            <li style={{ '--index': 7 }}>
              <NavLink to="/estimator" className="mobile-nav-link" onClick={closeMobileMenu}>
                Estimator
              </NavLink>
            </li>
            <li style={{ '--index': 8 }}>
              <NavLink to="/contact" className="mobile-nav-link mobile-nav-link-cta" onClick={closeMobileMenu}>
                Contact Us
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
