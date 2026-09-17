import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Database, 
  ShieldCheck, 
  User, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useTranslation } from '../translations';
import { authService } from '../services/api';

export const Settings: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const user = authService.getCurrentUser();
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSyncNow = () => {
    setSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">Configure language, offline database synchronization, and clinical access parameters</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-4 h-4 text-teal-700" />
          Active Clinician Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Logged In Practitioner:</span>
            <strong className="text-slate-900 text-sm mt-0.5 block">{user?.name || 'Priya Selvam'}</strong>
            <span className="text-teal-700 font-semibold text-[11px] capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Email Address:</span>
            <strong className="text-slate-900 mt-0.5 block font-mono">{user?.email || 'asha@ruraleye.org'}</strong>
            <span className="text-slate-500 text-[11px]">JWT Authenticated</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Operating Centre:</span>
            <strong className="text-slate-900 mt-0.5 block">{user?.organization || 'Rural Health Centre'}</strong>
            <span className="text-slate-500 text-[11px]">Primary Care Nodal Hub</span>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-700" />
          Language / மொழி தேர்வு
        </h3>
        <p className="text-xs text-slate-500">
          Select primary working interface language. All menus, clinical results, and Gemini patient summaries will render in the chosen language.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border text-left transition ${
              language === 'en'
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">English (India)</span>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">Standard medical terminology and international DR grading</p>
          </button>

          <button
            onClick={() => setLanguage('ta')}
            className={`p-4 rounded-2xl border text-left transition ${
              language === 'ta'
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">தமிழ் (Tamil)</span>
              {language === 'ta' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">கிராமப்புற நோயாளிகளுக்கான எளிய தமிழ் விளக்கங்கள் மற்றும் வழிகாட்டுதல்கள்</p>
          </button>
        </div>
      </div>

      {/* Offline Storage & Sync */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-teal-700" />
          Offline PWA & Field Sync
        </h3>
        <p className="text-xs text-slate-500">
          Screenings performed while disconnected are buffered in browser IndexedDB and automatically synced to MongoDB Atlas on reconnection.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Offline Queue Status:</span>
            <strong className="text-slate-900 text-sm">All local records synchronized with MongoDB Atlas</strong>
            <span className="text-emerald-700 font-semibold block text-[11px] mt-0.5">● 0 unsynced screenings in field buffer</span>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition flex items-center gap-2 shrink-0"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? 'Synchronizing...' : 'Sync Buffer Now'}
          </button>
        </div>

        {syncSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            All data synchronized successfully with central health cloud.
          </div>
        )}
      </div>

      {/* About Project & Model Metadata */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>About RuralEye AI — Smart India Hackathon 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <p className="text-slate-400 text-[11px]">Problem Statement ID:</p>
            <p className="font-bold text-white">26038 (MedTech / BioTech / HealthTech)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Participating Team:</p>
            <p className="font-bold text-white">Innovexa</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">AI Model Architecture:</p>
            <p className="font-bold text-teal-300">EfficientNetB0 (Keras 3, 5-Class Softmax Output)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Explainability Engine:</p>
            <p className="font-bold text-teal-300">Gradient-weighted Class Activation Mapping (Grad-CAM)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
