import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, ShieldCheck, Sparkles, Stethoscope, User, ArrowRight, AlertCircle } from 'lucide-react';
import { authService, DEMO_CREDENTIALS } from '../services/api';
import { useTranslation } from '../translations';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid login credentials. Use one of the Demo accounts below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey: 'healthcare_worker' | 'doctor' | 'admin') => {
    const cred = DEMO_CREDENTIALS[roleKey];
    setEmail(cred.email);
    setPassword(cred.password);
    setLoading(true);
    setError('');
    try {
      await authService.login(cred.email, cred.password);
      if (roleKey === 'doctor') {
        navigate('/doctor-review');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Login error. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Side: Branding & Medical Trust */}
        <div className="md:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">RuralEye</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 ml-1.5 border border-teal-500/30">AI</span>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
              Quality-First, Explainable Diabetic Retinopathy Screening
            </h2>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Clinical decision-support designed for rural health workers (ASHA) and district ophthalmologists across India.
            </p>
          </div>

          <div className="mt-8 space-y-4 pt-6 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>SIH 2026 Problem Statement ID: 26038</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Doctor-in-the-Loop Architecture</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400">
              <span className="text-teal-300 font-semibold">Judge Demo Mode:</span> Use the one-click demo credentials on the right to test each stakeholder portal.
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & One-Click Demo Buttons */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Portal Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials or select a demonstration role</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. asha@ruraleye.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 mr-2" />
                Remember session
              </label>
              <span className="text-slate-400">Encrypted JWT</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demonstration Quick Access for Hackathon Judges */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Logins for SIH Judges:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('healthcare_worker')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-teal-900 font-semibold text-center transition flex flex-col items-center"
              >
                <span className="font-bold">Healthcare Worker</span>
                <span className="text-[10px] text-teal-700 opacity-80 mt-0.5">Priya (ASHA)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 font-semibold text-center transition flex flex-col items-center"
              >
                <span className="font-bold">Doctor / Ophth</span>
                <span className="text-[10px] text-blue-700 opacity-80 mt-0.5">Dr. Ramanathan</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 font-semibold text-center transition flex flex-col items-center"
              >
                <span className="font-bold">State Admin</span>
                <span className="text-[10px] text-purple-700 opacity-80 mt-0.5">Health Nodal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
