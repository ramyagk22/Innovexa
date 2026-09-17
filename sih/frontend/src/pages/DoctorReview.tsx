import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Check, 
  RotateCcw, 
  Edit3, 
  Sparkles, 
  Eye, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Filter,
  ExternalLink
} from 'lucide-react';
import { doctorService, reportService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { DRGradingReference, DR_GRADING_LEVELS } from '../components/DRGradingReference';

export const DoctorReview: React.FC = () => {
  const navigate = useNavigate();
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [selectedScreening, setSelectedScreening] = useState<any>(null);
  const [assessmentClass, setAssessmentClass] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPending = () => {
    setLoading(true);
    doctorService.getPending()
      .then((data) => {
        setPendingQueue(data);
        if (data.length > 0) {
          setSelectedScreening(data[0]);
          setAssessmentClass(data[0].ai_prediction?.predicted_class || 0);
        }
      })
      .catch((err) => console.error('Pending load err:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleSelectScreening = (s: any) => {
    setSelectedScreening(s);
    setAssessmentClass(s.ai_prediction?.predicted_class || 0);
    setNotes('');
    setRecommendation('');
  };

  const handleSubmit = async (status: 'confirmed' | 'modified' | 'recapture_requested') => {
    if (!selectedScreening) return;
    setSubmitting(true);
    try {
      const scrId = selectedScreening.screening_id || selectedScreening.id;
      await doctorService.submitReview({
        screening_id: scrId,
        doctor_assessment_class: assessmentClass,
        status,
        notes: notes || 'Clinical assessment verified against fundus photography and Grad-CAM attention regions.',
        recommendation: recommendation || 'Continue standard diabetic glycemic management protocol.'
      });
      // Auto-generate report
      await reportService.generateReport(scrId);
      loadPending();
      alert(`Doctor assessment ${status.toUpperCase()} recorded successfully!`);
    } catch (err: any) {
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Ophthalmologist Clinical Console</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Doctor-in-the-Loop Review</h2>
          <p className="text-xs text-slate-500 mt-1">Review pending field screenings, verify Grad-CAM attention, and sign official diagnostic assessments</p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {pendingQueue.length} Screenings Awaiting Review
        </span>
      </div>

      {pendingQueue.length === 0 && !loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Field Screenings Reviewed!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no unverified screenings awaiting doctor review. New captures from rural PHCs will appear here automatically.
          </p>
          <button
            onClick={() => navigate('/screening/new')}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition"
          >
            Start a New Screening
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pending Queue List */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 h-fit max-h-[800px] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-900">
              <span>Pending Queue ({pendingQueue.length})</span>
              <span className="text-slate-400 font-normal">Triage list</span>
            </div>

            <div className="space-y-2.5">
              {pendingQueue.map((s) => {
                const isSelected = selectedScreening?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectScreening(s)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{s.patient_name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{s.patient_id}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="font-semibold text-amber-700">{s.ai_prediction?.suspected_label}</span>
                      <span className="text-[10px] text-slate-400">{s.created_at?.substring(0, 10)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Screening Clinical Detail & Actions */}
          {selectedScreening && (
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Reviewing: {selectedScreening.patient_name} ({selectedScreening.patient_id})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Age: {selectedScreening.patient_age} • Gender: {selectedScreening.patient_gender} • Date: {selectedScreening.created_at?.substring(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                    Quality: {selectedScreening.quality_metrics?.status || 'GOOD'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold">
                    Reliability: {selectedScreening.reliability?.level || 'HIGH'}
                  </span>
                </div>
              </div>

              {/* Side-by-side Images: Original, Enhanced, Grad-CAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Original Fundus</span>
                  <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200">
                    <img src={selectedScreening.image_url} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase block mb-1.5">AI Evidence (Grad-CAM)</span>
                  <div className="aspect-square bg-black rounded-2xl overflow-hidden border-2 border-teal-500 shadow-sm">
                    <img src={selectedScreening.gradcam?.overlay_url} alt="Grad-CAM" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* AI Findings Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Screening Output:</span>
                  <strong className="text-amber-400 text-sm">{selectedScreening.ai_prediction?.suspected_label}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Confidence: {selectedScreening.ai_prediction?.confidence_percentage}%</span>
                  <span>Attention: {selectedScreening.gradcam?.attention_summary}</span>
                </div>
              </div>

              {/* Doctor Review Inputs */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Assessment Grade:
                  </label>
                  <select
                    value={assessmentClass}
                    onChange={(e) => setAssessmentClass(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    <option value={0}>Level 0: No Retinopathy</option>
                    <option value={1}>Level 1: Very Mild NPDR</option>
                    <option value={2}>Level 2: Mild NPDR</option>
                    <option value={3}>Level 3: Moderate NPDR</option>
                    <option value={4}>Level 4: Severe NPDR</option>
                  </select>

                  {/* Dynamic DR Clinical Description for Doctor */}
                  {DR_GRADING_LEVELS[assessmentClass] && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {DR_GRADING_LEVELS[assessmentClass].fullName}
                        </span>
                        <a
                          href={DR_GRADING_LEVELS[assessmentClass].referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-0.5"
                        >
                          Source [1]
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {DR_GRADING_LEVELS[assessmentClass].description}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Clinical Notes & Observations:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter retinal observations, microaneurysm distribution, or CSME status..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Treatment & Referral Recommendation:
                  </label>
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="e.g. Schedule dilated fundus examination, strict glycemic control, return in 3 months."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Clinical DR Severity Grading Scale */}
              <div className="pt-2">
                <DRGradingReference
                  activeLevel={assessmentClass}
                  mode="interactive"
                  title="Diabetic Retinopathy Clinical Reference"
                  subtitle="ETDRS / ICDR Standardized Disease Severity Scale"
                />
              </div>

              {/* Doctor Actions */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <button
                  onClick={() => handleSubmit('recapture_requested')}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Recapture
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit('modified')}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modify Assessment
                  </button>
                  <button
                    onClick={() => handleSubmit('confirmed')}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Confirm AI Result
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
