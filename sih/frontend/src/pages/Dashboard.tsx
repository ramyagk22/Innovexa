import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Eye, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../translations';
import { dashboardService, authService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { PriorityAlerts } from '../components/PriorityAlerts';
import { ChartSection } from '../components/ChartSection';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    dashboardService.getStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error('Dashboard load err:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SIH 2026 Live Clinical Dashboard</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.dashboard.greeting}, {user?.name?.split(' ')[0] || 'Clinician'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/patients')}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            {t.dashboard.viewAll}
          </button>
          <button
            onClick={() => navigate('/screening/new')}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-900/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Screening
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t.dashboard.totalPatients}
          value={stats?.total_patients || '5'}
          subtitle="Registered in PHC"
          icon={Users}
          trend={{ value: '+12% this week', isUp: true }}
          colorScheme="teal"
        />
        <StatCard
          title={t.dashboard.todayScreenings}
          value={stats?.today_screenings || '14'}
          subtitle="Field retinal captures"
          icon={Eye}
          trend={{ value: '+4 vs yesterday', isUp: true }}
          colorScheme="blue"
        />
        <StatCard
          title={t.dashboard.pendingReviews}
          value={stats?.pending_doctor_reviews || '3'}
          subtitle="Awaiting ophthalmologist"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title={t.dashboard.poorQuality}
          value={stats?.poor_quality_images || '2'}
          subtitle="Quality Gate blocked"
          icon={AlertTriangle}
          colorScheme="rose"
        />
      </div>

      {/* Priority Alerts Widget */}
      {stats?.priority_alerts && stats.priority_alerts.length > 0 && (
        <PriorityAlerts alerts={stats.priority_alerts} />
      )}

      {/* Interactive Charts Section */}
      {stats && (
        <ChartSection
          timeline={stats.timeline || []}
          drDistribution={stats.dr_distribution || {}}
          qualityDistribution={stats.quality_distribution || {}}
        />
      )}

      {/* Recent Screenings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{t.dashboard.recentScreenings}</h3>
            <p className="text-xs text-slate-500">Live feed of verified and pending primary care screenings</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Full Timeline
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Patient ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Image Quality</th>
                <th className="py-3 px-4">AI Screening Result</th>
                <th className="py-3 px-4">Reliability</th>
                <th className="py-3 px-4">Doctor Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recent_screenings?.map((item: any) => {
                const isGoodQuality = item.image_quality === 'GOOD';
                const isBorderline = item.image_quality === 'BORDERLINE';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-5 font-bold text-slate-900">
                      <div>{item.patient_id}</div>
                      <div className="text-[11px] font-normal text-slate-400">{item.patient_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isGoodQuality 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isBorderline 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.image_quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.ai_prediction}
                      <span className="ml-1.5 text-[10px] text-slate-400 font-normal">({item.confidence}%)</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.reliability === 'HIGH' 
                          ? 'bg-teal-50 text-teal-700' 
                          : item.reliability === 'MEDIUM' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.reliability}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.doctor_status === 'Reviewed' || item.doctor_status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.doctor_status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => navigate(`/patients/${item.patient_id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
