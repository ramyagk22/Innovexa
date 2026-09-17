import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface ChartSectionProps {
  timeline: Array<{ day: string; screenings: number; detected_dr: number }>;
  drDistribution: Record<string, number>;
  qualityDistribution: Record<string, number>;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  timeline,
  drDistribution,
  qualityDistribution
}) => {
  const drData = [
    { name: 'No DR', count: drDistribution['No DR'] || 0, color: '#10b981' },
    { name: 'Mild', count: drDistribution['Mild'] || 0, color: '#3b82f6' },
    { name: 'Moderate', count: drDistribution['Moderate'] || 0, color: '#f59e0b' },
    { name: 'Severe', count: drDistribution['Severe'] || 0, color: '#f97316' },
    { name: 'Proliferative', count: drDistribution['Proliferative'] || 0, color: '#ef4444' },
  ];

  const qualityData = [
    { name: 'Good Quality', value: qualityDistribution['GOOD'] || 0, color: '#10b981' },
    { name: 'Borderline', value: qualityDistribution['BORDERLINE'] || 0, color: '#f59e0b' },
    { name: 'Poor Quality', value: qualityDistribution['POOR'] || 0, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Screening Volume Over Time */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Screening Volume & DR Detections</h3>
            <p className="text-xs text-slate-500">7-Day field screening trends in rural health centres</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-1.5"></span> Total Screened
            </span>
            <span className="flex items-center text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> DR Suspected
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScreenings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="screenings" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScreenings)" />
              <Area type="monotone" dataKey="detected_dr" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDetected)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Quality Gate Distribution Donut */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quality Gate Inspection</h3>
        <p className="text-xs text-slate-500 mb-2">Fundus optical quality before AI</p>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={qualityData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center text-xs">
          <div>
            <p className="text-emerald-600 font-bold">{qualityDistribution['GOOD'] || 0}</p>
            <p className="text-[10px] text-slate-500">Good</p>
          </div>
          <div>
            <p className="text-amber-600 font-bold">{qualityDistribution['BORDERLINE'] || 0}</p>
            <p className="text-[10px] text-slate-500">Borderline</p>
          </div>
          <div>
            <p className="text-rose-600 font-bold">{qualityDistribution['POOR'] || 0}</p>
            <p className="text-[10px] text-slate-500">Poor (Blocked)</p>
          </div>
        </div>
      </div>

      {/* 3. DR Severity Distribution Full Width below */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Diabetic Retinopathy Severity Distribution</h3>
            <p className="text-xs text-slate-500">Model classification breakdown across all screened individuals</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={drData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {drData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
