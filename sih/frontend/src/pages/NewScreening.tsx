import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  BarChart3, 
  HelpCircle, 
  User, 
  Check, 
  RefreshCw,
  Layers,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '../translations';
import { 
  patientService, 
  screeningService, 
  doctorService 
} from '../services/api';
import { DRGradingReference, DR_GRADING_LEVELS } from '../components/DRGradingReference';

export const NewScreening: React.FC = () => {
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Wizard Steps: 1: Patient, 2: Upload, 3: Quality Gate, 4: Enhancement (if borderline), 5: AI Prediction, 6: Explain & Reliability, 7: Doctor Handover
  const [step, setStep] = useState<number>(1);

  // Patient Selection
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Quality Gate State
  const [qualityChecking, setQualityChecking] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);

  // Enhancement State
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<any>(null);

  // AI Prediction State
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [overrideActive, setOverrideActive] = useState<boolean>(false);

  // Explainable AI & Reliability & Gemini State
  const [explaining, setExplaining] = useState(false);
  const [finalScreening, setFinalScreening] = useState<any>(null);

  // Doctor Review Handover State
  const [submittingReview, setSubmittingReview] = useState(false);
  const [doctorAssessmentClass, setDoctorAssessmentClass] = useState<number>(0);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorRecommendation, setDoctorRecommendation] = useState('');

  // Sample Images for instant Judge Demo
  const demoSamples = [
    { name: 'Normal Retina (Grade 0)', path: '/samples/normal.jpg', desc: 'Sharp optic disc & macula' },
    { name: 'Diabetic Retinopathy (NPDR)', path: '/samples/dr_moderate.jpg', desc: 'Exudates & microaneurysms' },
  ];

  // Initialize
  useEffect(() => {
    patientService.getPatients().then((data) => {
      setPatients(data);
      const preselectedId = searchParams.get('patientId');
      if (preselectedId) {
        const found = data.find((p: any) => p.patient_id === preselectedId);
        if (found) {
          setSelectedPatient(found);
          setStep(2); // Jump straight to upload
        }
      } else if (data.length > 0) {
        setSelectedPatient(data[0]);
      }
    });
  }, [searchParams]);

  // Handle Image File Selection
  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload and execute OpenCV Quality Gate
  const handleAnalyzeUpload = async (fileToUpload?: File, samplePath?: string) => {
    setIsUploading(true);
    setQualityChecking(true);
    try {
      let filename = '';

      if (samplePath) {
        // Fetch sample file as blob for real upload
        const res = await fetch(samplePath);
        const blob = await res.blob();
        const f = new File([blob], samplePath.split('/').pop() || 'sample.jpg', { type: 'image/jpeg' });
        const uploadRes = await screeningService.uploadImage(f);
        filename = uploadRes.filename;
        setPreviewUrl(uploadRes.url);
      } else if (fileToUpload || selectedFile) {
        const f = fileToUpload || selectedFile;
        if (!f) return;
        const uploadRes = await screeningService.uploadImage(f);
        filename = uploadRes.filename;
        setPreviewUrl(uploadRes.url);
      }

      setUploadedFilename(filename);
      setIsUploading(false);

      // Run OpenCV Quality Gate
      const qRes = await screeningService.checkQuality(filename);
      setQualityMetrics(qRes);
      setStep(3); // Advance to Quality Gate
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error uploading image. Check backend connection.');
    } finally {
      setIsUploading(false);
      setQualityChecking(false);
    }
  };

  // Handle CLAHE Enhancement
  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const res = await screeningService.enhanceImage(uploadedFilename);
      setEnhancementResult(res);
      setQualityMetrics(res.enhanced_metrics);
      setStep(4);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Enhancement failed.');
    } finally {
      setEnhancing(false);
    }
  };

  // Run Real Keras DR Prediction
  const handleRunPrediction = async (override: boolean = false) => {
    if (override) setOverrideActive(true);
    setPredicting(true);
    try {
      const res = await screeningService.predictDR(uploadedFilename, selectedPatient.patient_id, override || overrideActive);
      setPrediction(res);
      setDoctorAssessmentClass(res.predicted_class);
      setStep(5);
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || 'Prediction failed.';
      alert(`Prediction blocked by Quality Gate: ${msg}`);
    } finally {
      setPredicting(false);
    }
  };

  // Run Grad-CAM & Finalize
  const handleExplain = async () => {
    setExplaining(true);
    try {
      const res = await screeningService.explainAndFinalize(uploadedFilename, selectedPatient.patient_id, overrideActive);
      setFinalScreening(res);
      setStep(6);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Explainable AI computation failed.');
    } finally {
      setExplaining(false);
    }
  };

  // Submit Doctor Review
  const handleSubmitDoctorReview = async (reviewStatus: string) => {
    if (!finalScreening?.screening_id) return;
    setSubmittingReview(true);
    try {
      await doctorService.submitReview({
        screening_id: finalScreening.screening_id,
        doctor_assessment_class: doctorAssessmentClass,
        status: reviewStatus,
        notes: doctorNotes || 'Verified fundus image and Grad-CAM attention regions.',
        recommendation: doctorRecommendation || 'Follow standard HbA1c control protocol.'
      });
      navigate(`/reports`);
    } catch (err: any) {
      alert('Failed to save doctor review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const wizardSteps = [
    { num: 1, title: 'Patient' },
    { num: 2, title: 'Upload' },
    { num: 3, title: 'Quality Gate' },
    { num: 4, title: 'Enhancement' },
    { num: 5, title: 'AI Prediction' },
    { num: 6, title: 'Evidence & XAI' },
    { num: 7, title: 'Doctor Review' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2">
          {wizardSteps.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div key={s.num} className="flex items-center space-x-2 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  isActive 
                    ? 'bg-teal-700 text-white shadow-xs shadow-teal-900/30 ring-4 ring-teal-50' 
                    : isCompleted 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-teal-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {s.title}
                </span>
                {s.num < 7 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PATIENT SELECTION */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1: Select Patient</h2>
              <p className="text-xs text-slate-500">Choose patient from registry to associate this retinal screening</p>
            </div>
            <button
              onClick={() => navigate('/patients/new')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              + Register New
            </button>
          </div>

          <div className="space-y-3">
            {patients.map((p) => (
              <div
                key={p.patient_id}
                onClick={() => setSelectedPatient(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedPatient?.patient_id === p.patient_id
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 font-bold flex items-center justify-center">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      <span className="text-xs font-mono font-bold text-teal-700">{p.patient_id}</span>
                    </div>
                    <p className="text-xs text-slate-500">{p.age} yrs • {p.gender} • {p.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Last Result: {p.latest_result || 'None'}
                  </span>
                  {selectedPatient?.patient_id === p.patient_id && (
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1 justify-end mt-1">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> Selected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={!selectedPatient}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              Continue to Retinal Upload
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: IMAGE UPLOAD & SAMPLE PICKER */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2: Upload Retinal Fundus Photograph</h2>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-900">{selectedPatient?.name} ({selectedPatient?.patient_id})</strong>
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Change Patient
            </button>
          </div>

          {/* Quick 1-Click Sample Library for SIH Demonstration */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Test with Authentic SIH Fundus Samples:
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">1-Click Test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoSamples.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleAnalyzeUpload(undefined, sample.path)}
                  className="p-3 rounded-xl bg-white border border-teal-200/80 hover:border-teal-500 hover:shadow-xs text-left transition flex items-center space-x-3 group"
                >
                  <img src={sample.path} alt={sample.name} className="w-12 h-12 rounded-lg object-cover bg-black shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">{sample.name}</h4>
                    <p className="text-[11px] text-slate-500">{sample.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-3xl p-8 text-center transition bg-slate-50/50">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-sm relative">
                  <img src={previewUrl} alt="Retinal Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedFile?.name || 'Selected Fundus Image'}
                  </p>
                  <p className="text-[11px] text-slate-400">Ready for OpenCV Quality Gate</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={() => handleAnalyzeUpload()}
                    disabled={isUploading || qualityChecking}
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                  >
                    {qualityChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Analyze Image Quality
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Retinal Fundus Photograph</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Drag and drop or browse standard fundus photography (JPG, JPEG, PNG, max 25MB)
                  </p>
                </div>
                <div>
                  <label className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition">
                    Browse File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: OPENCV QUALITY GATE */}
      {/* ========================================================================= */}
      {step === 3 && qualityMetrics && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Clinical Quality Gate</span>
              <h2 className="text-xl font-black text-slate-900">Step 3: Optical Quality Inspection</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              qualityMetrics.status === 'GOOD'
                ? 'bg-emerald-100 text-emerald-800'
                : qualityMetrics.status === 'BORDERLINE'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              STATUS: {qualityMetrics.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Preview */}
            <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200 relative">
              <img src={previewUrl} alt="Quality Inspected Fundus" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-mono">
                Res: {qualityMetrics.resolution.width} x {qualityMetrics.resolution.height}
              </div>
            </div>

            {/* Quality Metrics Breakdown */}
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                qualityMetrics.status === 'GOOD'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : qualityMetrics.status === 'BORDERLINE'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <strong className="font-bold block text-sm mb-1">{qualityMetrics.message}</strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-90 mt-2">
                  {qualityMetrics.reasons.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Metric Meters */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Sharpness / Blur (Laplacian)</span>
                    <span className="font-mono">{qualityMetrics.blur_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${qualityMetrics.blur_score > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${Math.min(100, qualityMetrics.blur_score)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Disc Illumination</span>
                    <span className="font-mono">{qualityMetrics.brightness_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-teal-500" 
                      style={{ width: `${Math.min(100, qualityMetrics.brightness_score)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Vascular Contrast (Std Dev)</span>
                    <span className="font-mono">{qualityMetrics.contrast_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${Math.min(100, qualityMetrics.contrast_score)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Field of View Coverage</span>
                    <span className="font-mono">{qualityMetrics.fov_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500" 
                      style={{ width: `${Math.min(100, qualityMetrics.fov_score)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diabetic Retinopathy (DR) Clinical Severity Grading Scale (Levels 0 - 4) */}
          <div className="pt-2">
            <DRGradingReference 
              mode="full" 
              showCitation={true}
              title="Diabetic Retinopathy (DR) Clinical Severity Grading Scale"
              subtitle="Reference criteria [1] for evaluating retinal damage & vascular lesions alongside optical quality"
            />
          </div>

          {/* Action Decision Gate */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => { setStep(2); setSelectedFile(null); setPreviewUrl(''); }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Recapture Image
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {qualityMetrics.status === 'BORDERLINE' && (
                <button
                  onClick={handleEnhance}
                  disabled={enhancing}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                >
                  {enhancing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                  Enhance Image (CLAHE)
                </button>
              )}

              {qualityMetrics.can_proceed && (
                <button
                  onClick={() => handleRunPrediction(false)}
                  disabled={predicting}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                >
                  {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Continue to AI Prediction
                </button>
              )}

              {!qualityMetrics.can_proceed && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    AI Prediction Blocked Due to Image Degradation
                  </div>
                  <button
                    onClick={() => handleRunPrediction(true)}
                    disabled={predicting}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    title="Bypass Quality Gate block for demonstration or clinical discretion"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    Clinical / Demo Override: Run Prediction →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: IMAGE ENHANCEMENT (CLAHE) */}
      {/* ========================================================================= */}
      {step === 4 && enhancementResult && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Contrast Limited Enhancement</span>
              <h2 className="text-xl font-black text-slate-900">Step 4: CLAHE Fundus Enhancement</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Contrast Improved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Fundus</span>
              <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200">
                <img src={enhancementResult.original_url} alt="Original" className="w-full h-full object-cover" />
              </div>
              <p className="text-[11px] text-slate-400">Contrast: {enhancementResult.original_metrics.contrast_score}/100</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">CLAHE Enhanced Fundus</span>
              <div className="aspect-square bg-black rounded-2xl overflow-hidden border-2 border-teal-500 shadow-sm">
                <img src={enhancementResult.enhanced_url} alt="Enhanced" className="w-full h-full object-cover" />
              </div>
              <p className="text-[11px] text-teal-700 font-bold">Enhanced Contrast: {enhancementResult.enhanced_metrics.contrast_score}/100</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
            <span>CLAHE unsharp masking enhanced microvascular borders and capillary contrast.</span>
            <button
              onClick={() => handleRunPrediction(false)}
              disabled={predicting}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 ml-4"
            >
              {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Proceed with Enhanced Image
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: AI SCREENING RESULT (AUTHENTIC 5-CLASS KERAS OUTPUT) */}
      {/* ========================================================================= */}
      {step === 5 && prediction && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Real EfficientNetB0 Keras Model</span>
              <h2 className="text-xl font-black text-slate-900">Step 5: DR Screening Result</h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-bold">
              final_model.keras
            </span>
          </div>

          {/* Large Result Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Suspected AI Classification</span>
              <h3 className="text-3xl font-black tracking-tight mt-1 text-amber-400">
                {prediction.suspected_label}
              </h3>
              <p className="text-xs text-slate-300">
                <strong className="text-white font-bold">Level {prediction.predicted_class}</strong>: {DR_GRADING_LEVELS[prediction.predicted_class]?.fullName || prediction.class_name}
              </p>
              <div className="text-xs text-slate-300 max-w-xl leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1.5">
                <p>
                  <strong className="text-teal-300">Clinical Hallmark: </strong>
                  {DR_GRADING_LEVELS[prediction.predicted_class]?.description}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 font-mono">ICDR Severity Standard</span>
                  <a
                    href={DR_GRADING_LEVELS[prediction.predicted_class]?.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:text-teal-300 font-bold inline-flex items-center gap-1"
                  >
                    Source [1] Eyes On EyeCare
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right shrink-0">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Model Confidence</p>
                <p className="text-3xl font-black text-white">{prediction.confidence_percentage}%</p>
              </div>
              <div className="w-px h-12 bg-slate-800"></div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quality Status</p>
                <p className="text-xl font-bold text-emerald-400">{qualityMetrics?.status || 'GOOD'}</p>
              </div>
            </div>
          </div>

          {/* 5-Stage Classification Breakdown with Clinical Descriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                5-Stage Probability Distribution (Actual Model Softmax Output)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Standard ETDRS / ICDR Scale
              </span>
            </div>

            <div className="space-y-2.5">
              {prediction.probabilities.map((cp: any) => {
                const isSelected = cp.class_index === prediction.predicted_class;
                const levelInfo = DR_GRADING_LEVELS[cp.class_index];

                return (
                  <div 
                    key={cp.class_index} 
                    className={`p-3 rounded-xl border transition ${
                      isSelected 
                        ? `${levelInfo?.bgLightClass || 'bg-teal-50'} ${levelInfo?.borderClass || 'border-teal-500'} ring-1 ring-teal-500/30` 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${levelInfo?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                          Level {cp.class_index}
                        </span>
                        <span className={`font-bold ${isSelected ? 'text-teal-950 font-black' : 'text-slate-800'}`}>
                          {levelInfo?.fullName || cp.class_name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                            Predicted
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-xs text-slate-900">{cp.percentage}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isSelected ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                        style={{ width: `${cp.percentage}%` }}
                      />
                    </div>

                    {levelInfo && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate pr-2">{levelInfo.description}</span>
                        <a
                          href={levelInfo.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 hover:text-teal-900 font-semibold shrink-0"
                          title="View clinical source [1]"
                        >
                          [1]
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Reference Section */}
          <div className="pt-2">
            <DRGradingReference
              activeLevel={prediction.predicted_class}
              mode="interactive"
              title="Diabetic Retinopathy Clinical Reference Console"
              subtitle="Inspect all clinical levels and pathology criteria to cross-examine AI prediction"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleExplain}
              disabled={explaining}
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              {explaining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Grad-CAM Evidence & Reliability
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: EXPLAINABLE AI (GRAD-CAM) + RELIABILITY + GEMINI */}
      {/* ========================================================================= */}
      {step === 6 && finalScreening && (
        <div className="space-y-6 animate-in fade-in">
          {/* Grad-CAM Visual Evidence */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Explainable AI (XAI)</span>
                <h2 className="text-xl font-black text-slate-900">Step 6: Why did the model make this prediction?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Highlighted regions represent areas that contributed to the model's prediction.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                Grad-CAM++ Feature Map
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Original Retinal Photograph</span>
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img src={finalScreening.image_url} alt="Original Fundus" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-teal-700 uppercase block mb-2">AI Evidence Map (Grad-CAM Overlay)</span>
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border-2 border-teal-500 shadow-xs">
                  <img src={finalScreening.gradcam.overlay_url} alt="Grad-CAM Overlay" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="text-slate-800 font-semibold leading-relaxed">
                <strong>Attention Summary:</strong> {finalScreening.gradcam.attention_summary}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                {finalScreening.gradcam.disclaimer}
              </p>
            </div>
          </div>

          {/* Reliability Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">AI Reliability Indicator</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                finalScreening.reliability.level === 'HIGH'
                  ? 'bg-emerald-100 text-emerald-800'
                  : finalScreening.reliability.level === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                RELIABILITY: {finalScreening.reliability.level} ({finalScreening.reliability.score}%)
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {finalScreening.reliability.message}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {finalScreening.reliability.factors.map((f: string, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
              {finalScreening.reliability.disclaimer}
            </p>
          </div>

          {/* Bilingual Gemini Clinical Summary */}
          {finalScreening.gemini_explanation && (
            <div className="bg-linear-to-r from-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-800/80">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-tight">Bilingual Clinical Explanation</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-800 text-teal-300 font-mono">
                  English & தமிழ்
                </span>
              </div>

              {/* English */}
              <div className="space-y-1 text-xs">
                <span className="text-teal-300 font-bold uppercase text-[10px]">English Summary:</span>
                <p className="text-slate-200 leading-relaxed">{finalScreening.gemini_explanation.english_summary}</p>
                <p className="text-slate-300 text-[11px] mt-1"><strong>Patient Guidance:</strong> {finalScreening.gemini_explanation.patient_guidance_en}</p>
              </div>

              {/* Tamil */}
              <div className="space-y-1 text-xs pt-3 border-t border-teal-800/60">
                <span className="text-teal-300 font-bold uppercase text-[10px]">தமிழ் விளக்கம் (Tamil Summary):</span>
                <p className="text-slate-200 leading-relaxed">{finalScreening.gemini_explanation.tamil_summary}</p>
                <p className="text-slate-300 text-[11px] mt-1"><strong>நோயாளிக்கான ஆலோசனை:</strong> {finalScreening.gemini_explanation.patient_guidance_ta}</p>
              </div>
            </div>
          )}

          {/* Doctor Handover Button */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Next Step: Doctor Verification</h4>
              <p className="text-xs text-slate-500">Submit screening to the district ophthalmologist review queue</p>
            </div>
            <button
              onClick={() => setStep(7)}
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              Transfer to Doctor Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: DOCTOR REVIEW CONSOLE */}
      {/* ========================================================================= */}
      {step === 7 && finalScreening && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Doctor-in-the-Loop Handover</span>
              <h2 className="text-xl font-black text-slate-900">Step 7: Ophthalmologist Assessment</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
              Verification Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doctor's Clinical Assessment Grade:
              </label>
              <select
                value={doctorAssessmentClass}
                onChange={(e) => setDoctorAssessmentClass(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value={0}>Level 0: No Retinopathy</option>
                <option value={1}>Level 1: Very Mild NPDR</option>
                <option value={2}>Level 2: Mild NPDR</option>
                <option value={3}>Level 3: Moderate NPDR</option>
                <option value={4}>Level 4: Severe NPDR</option>
              </select>

              {/* Dynamic DR Clinical Description for Doctor */}
              {DR_GRADING_LEVELS[doctorAssessmentClass] && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {DR_GRADING_LEVELS[doctorAssessmentClass].fullName}
                    </span>
                    <a
                      href={DR_GRADING_LEVELS[doctorAssessmentClass].referenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-0.5"
                    >
                      Source [1]
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {DR_GRADING_LEVELS[doctorAssessmentClass].description}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original AI Prediction (Immutable):
              </label>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                {finalScreening.ai_prediction.suspected_label} ({finalScreening.ai_prediction.confidence_percentage}%)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Notes & Fundus Findings:
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. Verified microaneurysms and hard exudate clusters in parafoveal zone. Clinical correlation matches AI."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Referral & Patient Management Recommendation:
            </label>
            <input
              type="text"
              value={doctorRecommendation}
              onChange={(e) => setDoctorRecommendation(e.target.value)}
              placeholder="e.g. Schedule dilated fundus examination and OCT referral within 3 weeks."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => handleSubmitDoctorReview('recapture_requested')}
              disabled={submittingReview}
              className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Request Recapture
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitDoctorReview('modified')}
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                ✎ Modify & Save
              </button>
              <button
                onClick={() => handleSubmitDoctorReview('confirmed')}
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                ✓ Confirm AI Result & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
