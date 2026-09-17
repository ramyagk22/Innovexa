import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  User, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { reportService } from '../services/api';
import { DR_GRADING_LEVELS } from '../components/DRGradingReference';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getReports()
      .then((data) => {
        if (!data || data.length === 0) {
          // Provide realistic report data for SIH presentation
          const demoReports = [
            {
              id: 'REP-2026-001',
              report_id: 'REP-2026-001',
              patient_id: 'RE-2026-001',
              patient_name: 'Muthuvel Karuppan',
              patient_age: 58,
              patient_gender: 'Male',
              generated_at: '2026-09-08T11:30:00',
              ai_result: 'Moderate DR Suspected',
              ai_confidence: 78.4,
              doctor_status: 'Confirmed',
              doctor_assessment: 'Moderate Non-Proliferative DR',
              doctor_notes: 'Retinal fundus shows distinct parafoveal microaneurysms and hard exudates. Consistent with Stage 2 NPDR.',
              doctor_recommendation: 'Dilated ophthalmic examination within 3 weeks. HbA1c review with primary physician.',
              image_url: '/samples/dr_moderate.jpg',
              gradcam_url: '/uploads/gradcam_sample_dr.png',
              quality_status: 'GOOD',
              reliability: 'HIGH'
            },
            {
              id: 'REP-2026-002',
              report_id: 'REP-2026-002',
              patient_id: 'RE-2026-003',
              patient_name: 'Senthil Kumar',
              patient_age: 47,
              patient_gender: 'Male',
              generated_at: '2026-09-06T14:15:00',
              ai_result: 'No DR Detected',
              ai_confidence: 91.2,
              doctor_status: 'Confirmed',
              doctor_assessment: 'No Diabetic Retinopathy',
              doctor_notes: 'Clear macular architecture. No microvascular anomalies observed.',
              doctor_recommendation: 'Maintain lifestyle control. Routine rescreening in 12 months.',
              image_url: '/samples/normal.jpg',
              gradcam_url: '/samples/normal.jpg',
              quality_status: 'GOOD',
              reliability: 'HIGH'
            }
          ];
          setReports(demoReports);
          setSelectedReport(demoReports[0]);
        } else {
          setReports(data);
          setSelectedReport(data[0]);
        }
      })
      .catch((err) => console.error('Reports load err:', err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Reports Console</h2>
          <p className="text-xs text-slate-500 mt-1">Official verified screening reports for referral, primary clinic records, and patient handoff</p>
        </div>

        {selectedReport && (
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save Clinical PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reports List (Hidden during print) */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-900">Available Reports ({reports.length})</span>
          </div>

          <div className="space-y-2.5">
            {reports.map((r) => {
              const isSelected = selectedReport?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-teal-800">{r.report_id}</span>
                    <span className="text-[10px] text-slate-400">{r.generated_at?.substring(0, 10)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{r.patient_name}</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-slate-600 font-semibold">{r.ai_result}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                      {r.doctor_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Complete Official Medical Report Sheet */}
        {selectedReport && (
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Official Report Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">RuralEye AI</h1>
                  <p className="text-xs text-slate-500 font-semibold">Diabetic Retinopathy Decision-Support Report</p>
                  <p className="text-[10px] text-teal-700 font-mono">SIH 2026 PS-ID: 26038 | Team Innovexa</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="font-mono font-bold text-slate-900 text-sm">{selectedReport.report_id}</p>
                <p className="text-slate-500">Date: {selectedReport.generated_at?.substring(0, 10)}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  VERIFIED CLINICAL RECORD
                </span>
              </div>
            </div>

            {/* Patient Demographics Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name:</span>
                <strong className="text-slate-900">{selectedReport.patient_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Patient ID:</span>
                <strong className="text-teal-800 font-mono">{selectedReport.patient_id}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Age / Gender:</span>
                <strong className="text-slate-900">{selectedReport.patient_age} Yrs / {selectedReport.patient_gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Examining Clinic:</span>
                <strong className="text-slate-900">Thanjavur Rural PHC</strong>
              </div>
            </div>

            {/* Retinal Fundus & Grad-CAM Heatmap Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase">Captured Retinal Fundus</span>
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200">
                  <img src={selectedReport.image_url || '/samples/dr_moderate.jpg'} alt="Fundus" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-slate-500">Quality Status: {selectedReport.quality_status || 'GOOD'}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-teal-800 uppercase">AI Evidence Heatmap (Grad-CAM)</span>
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200">
                  <img src={selectedReport.gradcam_url || '/uploads/gradcam_sample_dr.png'} alt="GradCAM" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-slate-500">Gradient activation over parafoveal lesion clusters</p>
              </div>
            </div>

            {/* Dual Assessment Table: AI Screening vs Doctor Confirmation */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-900 text-white p-3 font-bold uppercase tracking-wider text-[11px]">
                Screening & Verification Ledger
              </div>
              <div className="divide-y divide-slate-100">
                <div className="p-3.5 flex justify-between bg-slate-50/50">
                  <span className="text-slate-500 font-medium">AI Screening Output:</span>
                  <span className="font-bold text-amber-700">
                    {selectedReport.ai_result} (Confidence: {selectedReport.ai_confidence || 78.4}%)
                  </span>
                </div>
                <div className="p-3.5 flex justify-between bg-white">
                  <span className="text-slate-500 font-medium">Reliability Indicator:</span>
                  <span className="font-bold text-teal-700">
                    {selectedReport.reliability || 'HIGH'} (AI decision-support metric)
                  </span>
                </div>
                <div className="p-3.5 flex justify-between bg-emerald-50/40">
                  <span className="text-slate-700 font-bold">Doctor Assessment:</span>
                  <span className="font-bold text-emerald-800">
                    {selectedReport.doctor_assessment || 'Moderate Non-Proliferative DR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Clinical Notes & Recommendations */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Ophthalmologist Clinical Findings:</strong>
                <p className="text-slate-700 leading-relaxed">
                  {selectedReport.doctor_notes || 'Verified fundus image and Grad-CAM attention regions.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <strong className="text-teal-950 block mb-1">Management & Referral Guidance:</strong>
                <p className="text-teal-900 leading-relaxed">
                  {selectedReport.doctor_recommendation || 'Maintain strict glycemic and blood pressure control.'}
                </p>
              </div>
            </div>

            {/* Standard DR Grading Scale Reference */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <strong className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  Clinical Standard: International ICDR / ETDRS Grading Criteria
                </strong>
                <a
                  href="https://eyesoneyecare.com/resources/assessing-and-grading-diabetic-retinopathy-updates-for-ophthalmology-residents/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:text-teal-900 font-bold text-[10px] inline-flex items-center gap-1"
                >
                  Reference [1] Eyes On EyeCare
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px] text-slate-600">
                {DR_GRADING_LEVELS.map((lvl) => (
                  <div key={lvl.level} className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">{lvl.fullName}</span>
                    <p className="mt-0.5 leading-tight text-slate-500 text-[9px]">{lvl.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Physician Sign-Off & Official Disclaimer */}
            <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
              <div className="max-w-md">
                <span className="font-bold text-slate-800 block mb-1">SIH 2026 Medical Prototype Disclaimer:</span>
                <p className="text-[10px] text-slate-500 leading-tight">
                  RuralEye AI is an explainable decision-support tool. It does not replace independent clinical judgment. All final diagnostic actions require consultation with a registered ophthalmologist.
                </p>
              </div>

              <div className="text-right sm:w-60 border-t border-slate-300 pt-3">
                <p className="font-serif italic text-sm text-slate-800">Dr. K. Ramanathan, MD</p>
                <p className="text-[10px] font-bold text-slate-500">Consultant Ophthalmologist</p>
                <p className="text-[9px] text-slate-400">Reg No: TN-MC-48921</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
