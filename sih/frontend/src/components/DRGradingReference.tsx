import React, { useState } from 'react';
import { ExternalLink, Info, CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export interface DRLevelItem {
  level: number;
  label: string;
  stageName: string;
  fullName: string;
  description: string;
  hallmarks: string[];
  referenceLabel: string;
  referenceUrl: string;
  badgeClass: string;
  borderClass: string;
  bgLightClass: string;
  accentColor: string;
}

export const DR_GRADING_LEVELS: DRLevelItem[] = [
  {
    level: 0,
    label: 'Level 0',
    stageName: 'No Retinopathy',
    fullName: 'Level 0 (No Retinopathy)',
    description: 'No signs of damage or abnormal blood vessels in the retina.',
    hallmarks: ['Clear retinal fundus', 'No microaneurysms', 'Intact macula & fovea'],
    referenceLabel: '[1]',
    referenceUrl: 'https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-300',
    bgLightClass: 'bg-emerald-50/60',
    accentColor: '#10b981'
  },
  {
    level: 1,
    label: 'Level 1',
    stageName: 'Very Mild NPDR',
    fullName: 'Level 1 (Very Mild NPDR)',
    description: 'Only tiny bulges in blood vessels, called microaneurysms, are present.',
    hallmarks: ['Isolated microaneurysms only', 'No exudates', 'Normal vascular caliber'],
    referenceLabel: '[1]',
    referenceUrl: 'https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    borderClass: 'border-blue-300',
    bgLightClass: 'bg-blue-50/60',
    accentColor: '#3b82f6'
  },
  {
    level: 2,
    label: 'Level 2',
    stageName: 'Mild NPDR',
    fullName: 'Level 2 (Mild NPDR)',
    description: 'Microaneurysms exist alongside small fluid leaks, hard deposits, or small dot hemorrhages.',
    hallmarks: ['Microaneurysms', 'Small dot/blot hemorrhages', 'Hard lipid exudates'],
    referenceLabel: '[1]',
    referenceUrl: 'https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    borderClass: 'border-amber-300',
    bgLightClass: 'bg-amber-50/60',
    accentColor: '#f59e0b'
  },
  {
    level: 3,
    label: 'Level 3',
    stageName: 'Moderate NPDR',
    fullName: 'Level 3 (Moderate NPDR)',
    description: 'Blood vessel blockages increase, showing more bleeding or abnormal vessel shapes (intraretinal microvascular abnormalities).',
    hallmarks: ['Extensive hemorrhages in 1-3 quadrants', 'IRMA present', 'Cotton-wool spots / soft exudates'],
    referenceLabel: '[1]',
    referenceUrl: 'https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    borderClass: 'border-orange-300',
    bgLightClass: 'bg-orange-50/60',
    accentColor: '#f97316'
  },
  {
    level: 4,
    label: 'Level 4',
    stageName: 'Severe NPDR',
    fullName: 'Level 4 (Severe NPDR)',
    description: 'Extensive bleeding occurs across multiple areas, and blood vessels show significant swelling or bead-like narrowing (venous beading).',
    hallmarks: ['4-2-1 Rule: Hemorrhages in 4 quadrants', 'Venous beading in 2+ quadrants', 'Prominent IRMA in 1+ quadrant'],
    referenceLabel: '[1]',
    referenceUrl: 'https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    borderClass: 'border-rose-300',
    bgLightClass: 'bg-rose-50/60',
    accentColor: '#ef4444'
  }
];

interface DRGradingReferenceProps {
  activeLevel?: number | null;
  mode?: 'full' | 'compact' | 'interactive';
  showCitation?: boolean;
  title?: string;
  subtitle?: string;
  defaultExpanded?: boolean;
}

export const DRGradingReference: React.FC<DRGradingReferenceProps> = ({
  activeLevel = null,
  mode = 'full',
  showCitation = true,
  title = 'Diabetic Retinopathy (DR) Clinical Severity Reference',
  subtitle = 'ETDRS / ICDR Standardized Disease Severity Scale for Retinal Screening',
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [selectedTab, setSelectedTab] = useState<number>(activeLevel !== null && activeLevel !== undefined ? activeLevel : 0);

  // Sync selected tab if activeLevel changes
  React.useEffect(() => {
    if (activeLevel !== null && activeLevel !== undefined) {
      setSelectedTab(activeLevel);
    }
  }, [activeLevel]);

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition">
      {/* Header Bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-5 py-3.5 bg-linear-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {title}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 font-mono font-normal">
                Levels 0 – 4
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeLevel !== null && activeLevel !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
              Active: Level {activeLevel}
            </span>
          )}
          <button 
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-5 space-y-4">
          {mode === 'interactive' ? (
            /* Interactive Tabbed View */
            <div className="space-y-3">
              {/* Level Selector Pills */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {DR_GRADING_LEVELS.map((item) => {
                  const isActive = selectedTab === item.level;
                  const isCurrentPrediction = activeLevel === item.level;

                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedTab(item.level)}
                      className={`p-2 rounded-xl text-center border transition relative ${
                        isActive
                          ? `${item.bgLightClass} ${item.borderClass} ring-2 ring-teal-500/20 shadow-xs`
                          : 'bg-white border-slate-200 hover:bg-slate-100/70 text-slate-600'
                      }`}
                    >
                      {isCurrentPrediction && (
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-xs" title="Predicted DR Grade" />
                      )}
                      <div className="text-[10px] sm:text-xs font-black" style={{ color: isActive ? item.accentColor : undefined }}>
                        {item.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-medium truncate text-slate-500">
                        {item.stageName}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Level Detail Card */}
              {(() => {
                const current = DR_GRADING_LEVELS[selectedTab];
                return (
                  <div className={`p-4 rounded-xl border ${current.bgLightClass} ${current.borderClass} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.badgeClass}`}>
                          {current.fullName}
                        </span>
                        {activeLevel === current.level && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                            Current Detection
                          </span>
                        )}
                      </div>
                      <a
                        href={current.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 group"
                        title="View Ophthalmology Residents DR Grading Reference"
                      >
                        Source {current.referenceLabel}
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {current.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {current.hallmarks.map((h, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono">
                          • {h}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Full Grid / List View of All 5 Levels */
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {DR_GRADING_LEVELS.map((item) => {
                const isCurrentPrediction = activeLevel === item.level;

                return (
                  <div
                    key={item.level}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      isCurrentPrediction
                        ? `${item.bgLightClass} ${item.borderClass} ring-2 ring-teal-500/30 shadow-md`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeClass}`}>
                          {item.label}
                        </span>
                        {isCurrentPrediction && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white tracking-wider uppercase">
                            Target
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-black text-slate-900 leading-tight">
                        {item.stageName}
                      </h5>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400">
                        ETDRS Grade {item.level}
                      </span>
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-0.5"
                        title="Eyes On EyeCare Reference"
                      >
                        {item.referenceLabel}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Academic / Clinical Reference Citation Footer */}
          {showCitation && (
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-700">[1] Clinical Standard:</span>
                <span>International Clinical Diabetic Retinopathy (ICDR) Disease Severity Scale</span>
              </div>
              <a
                href="https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/"
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Eyes On EyeCare: Assessing & Grading DR Updates for Ophthalmology Residents
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
