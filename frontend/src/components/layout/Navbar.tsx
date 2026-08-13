'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, Globe, Heart, BookOpen, LayoutDashboard, LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from '@/components/search/SearchBar';
import AuthModal from './AuthModal';
import { toast } from '@/components/ui/Toast';
import { getInitials } from '@/lib/utils';

function NavbarContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'homes' | 'experiences' | 'services'>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'homes' || tab === 'experiences' || tab === 'services' ? tab : 'all');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast('Logged out successfully', 'info');
    router.push('/');
  };

  const openLogin = () => { setAuthMode('login'); setShowAuthModal(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuthModal(true); };

  const isHome = pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar Row */}
          <div className="flex items-center justify-between h-20">
            {/* Logo (Image 2 & 3) */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <svg className="w-8 h-8 text-[#FF385C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.204-3.082 7.806-7.5 7.806-3.2 0-5.544-1.74-6.8-4.228-1.256 2.488-3.6 4.228-6.8 4.228-4.418 0-7.5-3.602-7.5-7.806 0-.964.226-1.859.882-3.415l.189-.434c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.24 0-2.167.632-3.141 2.378l-.34.646c-1.92 3.763-6.046 12.404-7.014 14.654l-.125.3c-.567 1.352-.78 2.054-.818 2.766L4.55 24c0 3.197 2.298 5.806 5.5 5.806 2.464 0 4.417-1.396 5.485-3.791l.465-1.045.465 1.045c1.068 2.395 3.021 3.791 5.485 3.791 3.202 0 5.5-2.609 5.5-5.806 0-.749-.228-1.488-.813-2.883l-.13-.303c-.968-2.25-5.094-10.891-7.014-14.654l-.34-.646C18.167 3.632 17.24 3 16 3zm0 12c2.209 0 4 1.791 4 4 0 2.235-1.776 4.195-4 5.92-2.224-1.725-4-3.685-4-5.92 0-2.209 1.791-4 4-4zm0 2a2 2 0 00-2 2c0 1.096.974 2.485 2 3.42 1.026-.935 2-2.324 2-3.42a2 2 0 00-2-2z" />
              </svg>
              <span className="text-xl font-bold text-[#FF385C] hidden sm:block tracking-tight">
                staybnb
              </span>
            </Link>

            {/* Center Area: Tabs when unscrolled (Image 2) vs Search Pill when scrolled (Image 3) */}
            <div className="flex-1 flex justify-center px-4">
              {isHome && !isScrolled ? (
                /* Unscrolled Tabs (Image 2) */
                <div className="hidden md:flex items-center gap-8 text-sm font-medium transition-all duration-300 transform scale-100 opacity-100">
                  {/* All */}
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      router.push('/?tab=all');
                    }}
                    className={`flex items-center gap-2.5 pb-2 transition-all relative ${
                      activeTab === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg leading-none">🌐</span>
                    <span>All</span>
                    {activeTab === 'all' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                  </button>

                  {/* Homes */}
                  <button
                    onClick={() => {
                      setActiveTab('homes');
                      router.push('/?tab=homes');
                    }}
                    className={`flex items-center gap-2.5 pb-2 transition-all relative ${
                      activeTab === 'homes' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg leading-none">🏡</span>
                    <span>Homes</span>
                    {activeTab === 'homes' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                  </button>

                  {/* Experiences */}
                  <button
                    onClick={() => {
                      setActiveTab('experiences');
                      router.push('/?tab=experiences');
                    }}
                    className={`flex items-center gap-2.5 pb-2 transition-all relative ${
                      activeTab === 'experiences' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg leading-none">🎈</span>
                    <span>Experiences</span>
                    {activeTab === 'experiences' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                  </button>

                  {/* Services */}
                  <button
                    onClick={() => {
                      setActiveTab('services');
                      router.push('/?tab=services');
                    }}
                    className={`flex items-center gap-2.5 pb-2 transition-all relative ${
                      activeTab === 'services' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg leading-none">🛎️</span>
                    <span>Services</span>
                    {activeTab === 'services' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                  </button>
                </div>
              ) : (
                /* Scrolled Compact Pill (Image 3) */
                <div className="transition-all duration-300 transform scale-100 opacity-100">
                  <SearchBar variant="navbar" tab={activeTab} />
                </div>
              )}
            </div>

            {/* Right Nav (Image 2 & 3) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/host/dashboard"
                className="hidden md:flex items-center text-sm font-semibold text-gray-800 
                  hover:bg-gray-100 px-4 py-2 rounded-full transition-all"
              >
                Become a host
              </Link>

              {/* Globe Icon */}
              <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
                <Globe className="w-4 h-4" />
              </button>

              {/* User Pill Button (Menu + User Avatar) */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full p-1.5 pl-3
                    hover:shadow-md transition-all duration-200 bg-white"
                >
                  <Menu className="w-4 h-4 text-gray-700" />
                  {user ? (
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 
                    w-56 overflow-hidden z-50 py-2 text-sm text-gray-800">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/trips" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          My Trips
                        </Link>
                        <Link href="/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <Heart className="w-4 h-4 text-gray-500" />
                          Wishlist
                        </Link>
                        <Link href="/host/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          Host Dashboard
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                          <LogOut className="w-4 h-4 text-gray-500" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setShowUserMenu(false); openLogin(); }} className="w-full flex items-center px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-left">
                          Log in
                        </button>
                        <button onClick={() => { setShowUserMenu(false); openRegister(); }} className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                          Sign up
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <Link href="/host/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                          Become a host
                        </Link>
                        <Link href="#" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                          Help Centre
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                          <span className="flex items-center gap-2">
                            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                            <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">{isDarkMode ? 'ON' : 'OFF'}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Header Row: Big Expanded Hero Search Bar when unscrolled (Image 2) */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isHome && !isScrolled
                ? 'opacity-100 py-3 border-t border-gray-100 relative z-30'
                : 'max-h-0 opacity-0 py-0 border-none pointer-events-none hidden'
            }`}
          >
            <div className="max-w-4xl mx-auto flex justify-center">
              <SearchBar tab={activeTab} />
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-20" />}>
      <NavbarContent />
    </Suspense>
  );
}
