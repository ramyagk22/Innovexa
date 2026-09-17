import React, { useState } from 'react';
import { Menu, Search, Bell, Globe, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../translations';
import { authService } from '../services/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenMobileMenu }) => {
  const { language, setLanguage } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const user = authService.getCurrentUser();

  const notifications = [
    { id: 1, title: 'Severe DR Screening Flagged', time: '10m ago', type: 'urgent', text: 'Patient RE-2026-004 requires priority ophthalmologist review.' },
    { id: 2, title: 'Borderline Fundus Enhanced', time: '45m ago', type: 'info', text: 'CLAHE enhancement completed for patient RE-2026-002.' },
    { id: 3, title: 'Offline Queue Synchronized', time: '2h ago', type: 'success', text: '3 cached field screenings successfully synced to MongoDB Atlas.' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      {/* Left side: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        {onOpenMobileMenu && (
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side: Search, Language Switcher, Notifications, User */}
      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md transition ${
              language === 'en' 
                ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 rounded-md transition ${
              language === 'ta' 
                ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Clinical Alerts</span>
                <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition text-xs border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-2"></span>
          {user?.role?.replace('_', ' ').toUpperCase() || 'HEALTHCARE WORKER'}
        </div>
      </div>
    </header>
  );
};
