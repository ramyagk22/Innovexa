import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  History, 
  UserCheck, 
  FileText, 
  Settings, 
  LogOut, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../translations';
import { authService, DEMO_CREDENTIALS } from '../services/api';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'syncing'>(
    navigator.onLine ? 'online' : 'offline'
  );

  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRoleSwitch = (roleKey: 'healthcare_worker' | 'doctor' | 'admin') => {
    const cred = DEMO_CREDENTIALS[roleKey];
    authService.login(cred.email, cred.password).then(() => {
      setCurrentUser(authService.getCurrentUser());
      if (roleKey === 'doctor') navigate('/doctor-review');
      else navigate('/dashboard');
    });
  };

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/patients', label: t.nav.patients, icon: Users },
    { to: '/screening/new', label: t.nav.newScreening, icon: Eye, highlight: true },
    { to: '/history', label: t.nav.screeningHistory, icon: History },
    { to: '/doctor-review', label: t.nav.doctorReview, icon: UserCheck },
    { to: '/reports', label: t.nav.reports, icon: FileText },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">RuralEye</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Explainable DR Screening</p>
          </div>
        </div>

        {/* SIH 2026 Badge */}
        <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <span className="font-medium flex items-center gap-1.5 text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            SIH 2026 Prototype
          </span>
          <span className="text-[10px] text-slate-400">ID: 26038</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/30' 
                  : item.highlight 
                    ? 'text-teal-400 hover:bg-teal-950/40 hover:text-teal-300' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Demo Quick Role Switcher for SIH Presentation */}
      <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/80">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {t.nav.quickRole} (SIH Presentation):
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            onClick={() => handleRoleSwitch('healthcare_worker')}
            className={`px-1.5 py-1 rounded text-center font-medium border transition ${
              currentUser?.role === 'healthcare_worker'
                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            ASHA
          </button>
          <button
            onClick={() => handleRoleSwitch('doctor')}
            className={`px-1.5 py-1 rounded text-center font-medium border transition ${
              currentUser?.role === 'doctor'
                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-1.5 py-1 rounded text-center font-medium border transition ${
              currentUser?.role === 'admin'
                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Network & User Status Bottom */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        {/* Network Status */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center space-x-2">
            {networkStatus === 'online' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                <span className="text-emerald-400 font-medium">{t.nav.online}</span>
              </>
            )}
            {networkStatus === 'syncing' && (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-amber-400 font-medium">{t.nav.syncing}</span>
              </>
            )}
            {networkStatus === 'offline' && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-rose-400 font-medium">{t.nav.offline}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400">PWA Store & Sync</span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-semibold text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Priya Selvam'}</p>
              <p className="text-[11px] text-slate-400 capitalize truncate">{currentUser?.role?.replace('_', ' ') || 'Healthcare Worker'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
            title={t.nav.logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
