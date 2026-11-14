import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Navbar } from './Navbar.jsx';
import { VoiceAssistantModal } from '../voice/VoiceAssistantModal.jsx';
import {
  Mic,
  Home,
  Search,
  Calendar,
  Clock,
  UserCheck,
  Shield,
  Building,
  Sparkles,
  Users,
} from 'lucide-react';

export const DashboardLayout = ({ children, title, subtitle, activeTab }) => {
  const { user, isCustomer, isCook, isAdmin, logout } = useAuth();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const customerNav = [
    { label: 'Discover Cooks', path: '/customer/dashboard', icon: Search },
    { label: 'Neighbourhood Pools', path: '/customer/pools', icon: Users },
    { label: 'My Bookings', path: '/customer/bookings', icon: Calendar },
  ];

  const cookNav = [
    { label: 'Schedule & Overview', path: '/cook/dashboard', icon: Home },
    { label: 'Manage Availability', path: '/cook/availability', icon: Clock },
    { label: 'Profile & Specialities', path: '/cook/profile', icon: UserCheck },
  ];

  const adminNav = [
    { label: 'Platform Overview', path: '/admin/dashboard', icon: Shield },
  ];

  const currentNav = isCustomer ? customerNav : isCook ? cookNav : adminNav;

  return (
    <div className="min-h-screen bg-[#F8F5EC] flex flex-col font-sans">
      <Navbar />

      {/* Sub-header Banner */}
      <div className="bg-[#102B21] text-[#F8F5EC] border-b border-[#173D2E] py-8 px-4 sm:px-6 lg:px-8 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-[#A5BE83]/20 text-[#A5BE83] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#A5BE83]/30">
                {isCustomer ? 'Household Portal' : isCook ? 'Cook Partner Hub' : 'System Administration'}
              </span>
              {user?.householdLocations?.[0]?.society && (
                <span className="text-[#F0EBDD]/70 text-xs flex items-center gap-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-[#A5BE83]" />
                  {user.householdLocations[0].society.name} ({user.householdLocations[0].building || 'Flat ' + user.householdLocations[0].flatNumber})
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              {title || `Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}`}
            </h1>
            {subtitle && <p className="text-sm text-[#F0EBDD]/75 mt-1">{subtitle}</p>}
          </div>

          {/* Signature Vani Voice Assistant Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-3 bg-[#A5BE83] hover:bg-[#BCD39F] text-[#102B21] font-semibold px-4 py-2.5 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-200 group"
              aria-label="Open Vani Voice Assistant"
            >
              <div className="w-7 h-7 rounded-xl bg-[#173D2E] flex items-center justify-center text-[#A5BE83] group-hover:scale-110 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold leading-none tracking-tight">
                  Speak to Vani
                </p>
                <p className="text-[10px] text-[#102B21]/70 leading-none mt-0.5">
                  Voice Assistant AI
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {currentNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#F8F5EC] text-[#102B21] shadow-card font-bold'
                    : 'text-[#F0EBDD]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#173D2E]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Integrated Vani Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
