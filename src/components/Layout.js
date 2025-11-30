import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaHome, FaImages, FaGamepad, FaEnvelope, FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaCog, FaUser } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('kaf_session_id');
    if (!sessionId) {
      // Generate unique session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('kaf_session_id', sessionId);
    }
    return sessionId;
  };

  // Check if we should log visit (once per session)
  const shouldLogVisit = (page) => {
    const sessionId = getSessionId();
    const lastVisitKey = `kaf_last_visit_${sessionId}`;
    const lastVisitPage = sessionStorage.getItem(lastVisitKey);

    // Log visit only if:
    // 1. It's the first visit in this session, OR
    // 2. The page changed (navigation to different page)
    if (!lastVisitPage || lastVisitPage !== page) {
      sessionStorage.setItem(lastVisitKey, page);
      return true;
    }

    return false;
  };

  const logVisit = async (page) => {
    // Only log if it's a new visit in this session
    if (!shouldLogVisit(page)) {
      return;
    }

    try {
      const sessionId = getSessionId();
      await api.post('/analytics/visit', {
        page,
        sessionId
      });
    } catch (error) {
      // Silent fail for analytics
      console.error('Analytics error:', error);
    }
  };

  React.useEffect(() => {
    const currentPage = window.location.pathname;
    // Only log visit on initial page load or page change
    logVisit(currentPage);
  }, [location.pathname]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data.settings);
      } catch (error) {
        // Silent fail
      }
    };
    fetchSettings();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-row-reverse items-center gap-1 flex-1 justify-end">
              {user ? (
                <>
                  <div className="flex items-center gap-1">
                    <Link
                      to="/"
                      className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/')
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={isActive('/') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaHome className="text-xs" />
                      <span>الرئيسية</span>
                      {isActive('/') && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                      )}
                    </Link>
                    <Link
                      to="/collections"
                      className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/collections')
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={isActive('/collections') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaImages className="text-xs" />
                      <span>الصور</span>
                      {isActive('/collections') && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                      )}
                    </Link>
                    <Link
                      to="/games"
                      className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/games')
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={isActive('/games') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaGamepad className="text-xs" />
                      <span>الألعاب</span>
                      {isActive('/games') && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                      )}
                    </Link>
                    <Link
                      to="/contact"
                      className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isActive('/contact')
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      style={isActive('/contact') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaEnvelope className="text-xs" />
                      <span>التواصل</span>
                      {isActive('/contact') && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                      )}
                    </Link>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMenuOpen(!userMenuOpen);
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-16 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm"
                              style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                              <span className="text-xs text-gray-500">
                                {isAdmin ? 'مدير' : 'مستخدم'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FaUser className="text-sm text-gray-500" />
                          <span className="text-sm">الملف الشخصي</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaCog className="text-sm text-gray-500" />
                            <span className="text-sm">لوحة التحكم</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors rounded-lg hover:bg-gray-50"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-white font-medium text-sm transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                    style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </nav>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group order-2 lg:order-1"
            >
              {settings?.header?.logoImage ? (
                <img
                  src={settings.header.logoImage}
                  alt={settings?.header?.logoText || 'KAF'}
                  className="h-10 w-auto"
                />
              ) : (
                <div
                  className="text-xl transition-all duration-300 group-hover:scale-105"
                  style={{
                    fontFamily: '"Playwrite NO", cursive',
                    fontOpticalSizing: 'auto',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    color: settings?.colors?.primary || '#1F2937',
                    letterSpacing: '0.1em'
                  }}
                >
                  {settings?.header?.logoText || 'KAF'}
                </div>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors order-1"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col gap-1">
                {user ? (
                  <>
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive('/')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      style={isActive('/') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaHome />
                      <span>الرئيسية</span>
                    </Link>
                    <Link
                      to="/collections"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive('/collections')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      style={isActive('/collections') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaImages />
                      <span>الصور</span>
                    </Link>
                    <Link
                      to="/games"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive('/games')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      style={isActive('/games') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaGamepad />
                      <span>الألعاب</span>
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive('/contact')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      style={isActive('/contact') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                    >
                      <FaEnvelope />
                      <span>التواصل</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${location.pathname.startsWith('/admin')
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        style={location.pathname.startsWith('/admin') ? { backgroundColor: settings?.colors?.primary || '#1F2937' } : {}}
                      >
                        <FaCog />
                        <span>لوحة التحكم</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 border-t border-gray-200 mt-2 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500">
                          {isAdmin ? 'مدير' : 'مستخدم'}
                        </span>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors text-center"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-white rounded-lg font-medium text-sm transition-all shadow-sm text-center"
                      style={{ backgroundColor: settings?.colors?.primary || '#1F2937' }}
                    >
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-xl font-bold mb-4">KAF</h3>
              <p className="text-gray-400">
                اجتماع أبا قسطور وأبونا عبد المسيح المناهري – أسرة مطاي بالقاهرة و٦ أكتوبر
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="hover:text-white transition-colors">
                    الصور
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="hover:text-white transition-colors">
                    الألعاب
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    التواصل
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">معلومات</h4>
              <p className="text-gray-400">
                جميع الحقوق محفوظة © {new Date().getFullYear()} KAF
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Developed by{' '}
              <a
                href="https://josam-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors font-medium underline decoration-dotted underline-offset-2"
              >
                Gerges Samuel
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
