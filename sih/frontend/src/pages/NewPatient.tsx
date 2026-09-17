import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { patientService } from '../services/api';

export const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [diabetesYears, setDiabetesYears] = useState<number | ''>('');
  const [bloodSugar, setBloodSugar] = useState<number | ''>('');
  const [location, setLocation] = useState('Valangaiman Primary Health Centre');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !age) {
      setError('Patient Name and Age are required.');
      return;
    }

    setLoading(true);
    try {
      const created = await patientService.createPatient({
        name: name.trim(),
        age: Number(age),
        gender,
        phone: phone.trim() || undefined,
        diabetes_duration_years: diabetesYears ? Number(diabetesYears) : undefined,
        blood_sugar_fasting: bloodSugar ? Number(bloodSugar) : undefined,
        location: location.trim() || 'Rural Health Centre'
      });

      // Navigate to new screening directly with this patient preselected
      navigate(`/screening/new?patientId=${created.patient_id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/patients')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patient Registry
      </button>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Register New Rural Patient</h2>
            <p className="text-xs text-slate-500">Capture demographic and diabetic health baseline for longitudinal tracking</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meenakshi Ammal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 58"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98421 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diabetes Duration (Years)</label>
              <input
                type="number"
                step="0.5"
                value={diabetesYears}
                onChange={(e) => setDiabetesYears(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 8.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Health Centre / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Valangaiman Primary Health Centre"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
            >
              {loading ? 'Registering...' : 'Create Patient & Start Screening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
