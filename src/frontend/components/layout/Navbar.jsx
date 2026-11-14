import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../common/Button.jsx';
import { VaniCookLogo } from '../common/VaniCookLogo.jsx';
import { notificationService } from '../../services/notificationService.js';
import {
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  Building,
  Bell,
  CheckCheck,
  Calendar,
  Search,
  Users,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isCook, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification Bell State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Find a Cook', href: isAuthenticated && isCustomer ? '/customer/dashboard' : '/#find-a-cook' },
    { name: 'Shared Cooking', href: isAuthenticated && isCustomer ? '/customer/pools' : '/#shared-cooking' },
    { name: 'For Cooks', href: '/#for-cooks' },
  ];

  // Fetch notifications for authenticated users
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications(10);
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside listener for notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5EC]/90 backdrop-blur-md border-b border-[#E7E3D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* VaniCook Logo */}
          <div className="flex items-center">
            <VaniCookLogo size="md" />
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-charcoal/80 hover:text-forest transition-colors font-sans"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isCustomer && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/customer/dashboard')}
                  >
                    Customer Hub
                  </Button>
                )}
                {isCook && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/cook/dashboard')}
                  >
                    Cook Hub
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Admin Portal
                  </Button>
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative w-10 h-10 rounded-xl bg-white border border-border hover:border-forest/40 flex items-center justify-center text-charcoal/70 hover:text-forest transition-all"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-border shadow-premium z-50 overflow-hidden">
                      <div className="p-4 bg-forest text-ivory flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-leaf" />
                          <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-white">
                            Notifications
                          </h4>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-leaf hover:underline font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-charcoal-muted text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-ivory/60 cursor-pointer transition-colors flex items-start gap-3 ${
                                !notif.isRead ? 'bg-[#F0EBDD]/40' : 'bg-white'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !notif.isRead ? 'bg-forest' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-forest line-clamp-1">
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-charcoal/70 line-clamp-2 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[9px] text-charcoal-muted block mt-1">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-border">
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={user?.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-forest/20 shadow-sm"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-charcoal leading-tight">
                      {user?.fullName}
                    </p>
                    <p className="text-[10px] text-charcoal-muted capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-charcoal-muted hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal hover:bg-cream-soft transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-[#F8F5EC] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-charcoal hover:text-forest py-2 border-b border-border/40"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <div className="w-2.5 h-2.5 rounded-full bg-leaf" />
                  <p className="text-xs text-charcoal font-semibold">
                    {user?.fullName} ({user?.role})
                  </p>
                </div>
                {isCustomer && (
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/customer/dashboard');
                    }}
                    icon={Search}
                  >
                    Discover Cooks
                  </Button>
                )}
                {isCustomer && (
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/customer/pools');
                    }}
                    icon={Users}
                  >
                    Neighbourhood Pools
                  </Button>
                )}
                {isCook && (
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/cook/dashboard');
                    }}
                    icon={Calendar}
                  >
                    Cook Schedule & Requests
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/admin/dashboard');
                    }}
                  >
                    Admin Portal
                  </Button>
                )}
                <Button
                  className="w-full justify-start text-red-700 hover:text-red-800"
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  icon={LogOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
