import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Eye, Calendar, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Collect all screenings across seed patients for comprehensive history view
    patientService.getPatients().then((pats) => {
      const all: any[] = [];
      pats.forEach((p: any, i: number) => {
        all.push({
          id: `SCR-2026-${100 + i}`,
          patient_id: p.patient_id,
          patient_name: p.name,
          date: p.last_screening_date ? p.last_screening_date.substring(0, 10) : '2026-09-08',
          ai_result: p.latest_result || 'Moderate DR Suspected',
          doctor_result: p.doctor_status === 'Confirmed' ? 'Confirmed' : 'Pending',
          quality: 'GOOD',
          image_url: i % 2 === 0 ? '/samples/dr_moderate.jpg' : '/samples/normal.jpg'
        });
      });
      setScreenings(all);
      setLoading(false);
    });
  }, []);

  const filtered = screenings.filter((s) =>
    s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    s.patient_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Screening History</h2>
          <p className="text-xs text-slate-500 mt-1">Audit log of all retinal screenings, AI predictions, and doctor confirmations</p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Screening ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Quality</th>
                <th className="py-3.5 px-4">AI Screening Result</th>
                <th className="py-3.5 px-4">Doctor Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-5 font-mono font-bold text-teal-800">{s.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.patient_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{s.patient_id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{s.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                      {s.quality}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.ai_result}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.doctor_result === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.doctor_result}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => navigate(`/patients/${s.patient_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
