import React from 'react';
import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  patient_id: string;
  action: string;
}

interface PriorityAlertsProps {
  alerts: AlertItem[];
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({ alerts }) => {
  const navigate = useNavigate();

  const handleAction = (alert: AlertItem) => {
    if (alert.action === 'Review') {
      navigate('/doctor-review');
    } else if (alert.action === 'Recapture') {
      navigate('/screening/new');
    } else {
      navigate(`/patients/${alert.patient_id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Priority Action Alerts
        </h3>
        <span className="text-xs text-slate-400">Rural Clinic Clinical Gate</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isWarning = alert.severity === 'warning';
          const isHigh = alert.severity === 'high';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                isHigh
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-teal-50/70 border-teal-200 text-teal-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {isHigh ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Info className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{alert.title}</h4>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{alert.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleAction(alert)}
                className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition ${
                  isHigh
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : isWarning
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                {alert.action}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
