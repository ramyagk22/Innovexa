import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, ArrowRight, Eye, Calendar, MapPin, Activity } from 'lucide-react';
import { patientService } from '../services/api';

export const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPatients = () => {
    setLoading(true);
    patientService.getPatients(search, filter)
      .then((data) => setPatients(data))
      .catch((err) => console.error('Error fetching patients:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Registry</h2>
          <p className="text-xs text-slate-500 mt-1">Manage rural cohort records, screening schedules, and longitudinal DR progression</p>
        </div>

        <button
          onClick={() => navigate('/patients/new')}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name or ID (e.g. RE-2026-001)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilter('recently_screened')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'recently_screened' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recently Screened
          </button>
          <button
            onClick={() => setFilter('pending_review')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'pending_review' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Review
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Patient ID</th>
                <th className="py-3.5 px-4">Name & Demographics</th>
                <th className="py-3.5 px-4">Primary Health Centre</th>
                <th className="py-3.5 px-4">Last Screening</th>
                <th className="py-3.5 px-4">Latest Result</th>
                <th className="py-3.5 px-4">Doctor Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading patient cohort...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-bold text-teal-800">
                      {p.patient_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.age} yrs • {p.gender} {p.diabetes_duration_years && `• DM: ${p.diabetes_duration_years} yrs`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.location || 'Rural Clinic'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.last_screening_date ? p.last_screening_date.substring(0, 10) : 'Not yet screened'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {p.latest_result || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        p.doctor_status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : p.doctor_status === 'Pending' || p.doctor_status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 font-semibold'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.doctor_status || 'None'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/patients/${p.patient_id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                      >
                        Profile & History
                      </button>
                      <button
                        onClick={() => navigate(`/screening/new?patientId=${p.patient_id}`)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition"
                      >
                        Screen Now
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
