import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  WifiOff, 
  FileCheck, 
  ChevronRight, 
  ArrowRight,
  Stethoscope,
  Microscope,
  Zap,
  Globe,
  Database,
  Smartphone
} from 'lucide-react';
import { useTranslation } from '../translations';

export const Landing: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-700/20">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">RuralEye</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart India Hackathon 2026</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#challenge" className="hover:text-teal-700 transition">The Challenge</a>
            <a href="#workflow" className="hover:text-teal-700 transition">How It Works</a>
            <a href="#features" className="hover:text-teal-700 transition">Features</a>
            <a href="#rural" className="hover:text-teal-700 transition">Rural Architecture</a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition ${language === 'en' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded-md transition ${language === 'ta' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'}`}
              >
                தமிழ்
              </button>
            </div>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              to="/screening/new"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm shadow-teal-900/20 transition flex items-center gap-1.5"
            >
              Start Screening
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-200 bg-linear-to-b from-teal-50/40 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>SIH 2026 Problem Statement ID: 26038 | Team Innovexa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {t.landing.heroTitle}
            </h1>

            <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              {t.landing.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                to="/screening/new"
                className="px-6 py-3.5 rounded-xl text-base font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-900/20 transition flex items-center gap-2"
              >
                {t.landing.startScreening}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#workflow"
                className="px-6 py-3.5 rounded-xl text-base font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs transition"
              >
                {t.landing.howItWorks}
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg">
              <div>
                <p className="text-xl font-bold text-slate-900">5 Stages</p>
                <p className="text-xs text-slate-500 font-medium">Authentic DR Grading</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-700">OpenCV Gate</p>
                <p className="text-xs text-slate-500 font-medium">Quality Before AI</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">Grad-CAM</p>
                <p className="text-xs text-slate-500 font-medium">True Lesion Heatmap</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: Clinical Decision Support Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-900 text-white p-6 shadow-2xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">RuralEye AI Decision Support</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  REAL KERAS MODEL
                </span>
              </div>

              {/* Fundus Preview + Overlays */}
              <div className="mt-4 relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-slate-800">
                <img 
                  src="/samples/dr_moderate.jpg" 
                  alt="Clinical Retinal Fundus" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating clinical badges */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-emerald-300">Quality: GOOD</span>
                  <span className="text-slate-400 text-[10px]">(Blur 84 | FoV 92)</span>
                </div>

                <div className="absolute bottom-3 inset-x-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">AI Screening Output:</span>
                    <span className="font-bold text-amber-400">Moderate DR Suspected</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Reliability Indicator:</span>
                    <span className="font-semibold text-teal-400">HIGH (82.4%)</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Grad-CAM: Localized to Parafovea</span>
                    <span className="text-emerald-400 font-medium">Doctor Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: The Rural Healthcare Challenge */}
      <section id="challenge" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2">
              {t.landing.challengeTitle}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.landing.challengeSub}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <CameraOff className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t.landing.c1Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.c1Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <WifiOff className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t.landing.c2Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.c2Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t.landing.c3Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.c3Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t.landing.c4Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.c4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Our 6-Step Clinical Architecture */}
      <section id="workflow" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
              Clinical Protocol
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t.landing.solutionTitle}
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Designed specifically to preserve patient safety and physician accountability in rural workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: '01', name: 'CAPTURE', desc: 'ASHA worker acquires retinal fundus photo at Primary Health Centre.' },
              { num: '02', name: 'CHECK', desc: 'OpenCV Quality Gate inspects blur, illumination, and contrast.' },
              { num: '03', name: 'ENHANCE', desc: 'CLAHE algorithm rescues borderline contrast images.' },
              { num: '04', name: 'PREDICT', desc: 'EfficientNetB0 Keras model grades retinopathy across 5 classes.' },
              { num: '05', name: 'EXPLAIN', desc: 'Grad-CAM computes true gradient heatmap on lesion regions.' },
              { num: '06', name: 'VERIFY', desc: 'Ophthalmologist reviews evidence, confirms or modifies assessment.' }
            ].map((step, idx) => (
              <div key={step.num} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 relative flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-teal-400/40">{step.num}</span>
                  <h4 className="text-sm font-bold text-white mt-2 tracking-wide">{step.name}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-teal-500">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Key Features Grid */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2">
              Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Medical Decision-Support Built for Real Field Conditions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Quality Before AI</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rejects blurry or degraded fundus images before AI inference to eliminate false clinical certainty.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">5-Class DR Grading</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard international grading: No DR, Mild, Moderate, Severe, and Proliferative DR with full softmax probability breakdown.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Explainable AI (Grad-CAM)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates genuine gradient activation heatmaps highlighting microaneurysms, hemorrhages, and lipid exudates.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Reliability Indicator</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates image clarity and Shannon prediction entropy to categorize AI reliability as HIGH, MEDIUM, or LOW.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                5
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Doctor-in-the-Loop</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors confirm or modify AI findings and input treatment recommendations without overriding raw AI evidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                6
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Tamil + English Bilingual</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full native Tamil (தமிழ்) and English support for both user interface and patient guidance summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Rural-First Architecture */}
      <section id="rural" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2">
                Deployment Architecture
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
                Engineered for India's Primary Health Centres
              </h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Low Bandwidth & Offline PWA:</strong> Progressive Web App with IndexedDB buffers field screenings when internet drops and synchronizes automatically on reconnection.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Edge Image Processing:</strong> OpenCV quality metrics calculate locally before network transfer, conserving rural mobile data quotas.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">MongoDB Cloud Sync:</strong> Secure patient registries and immutable audit logs maintained across central health networks.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h4 className="font-bold text-slate-900 text-base">Rural Readiness Scorecard</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Offline Caching (IndexedDB)</span>
                    <span className="text-teal-700">100% Ready</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Local Language Support (Tamil)</span>
                    <span className="text-teal-700">Native Parity</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Doctor Review Workflow</span>
                    <span className="text-teal-700">Verified Protocol</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Medical Disclaimer Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs leading-relaxed mb-8">
            <strong className="font-bold">Medical Disclaimer:</strong> {t.landing.disclaimer}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 RuralEye AI — Team Innovexa. Smart India Hackathon 2026 Prototype.</p>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="hover:text-slate-900">Sign In</Link>
              <Link to="/screening/new" className="hover:text-slate-900">New Screening</Link>
              <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function CameraOff(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="2" y2="22"/>
      <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16"/>
      <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5"/>
      <path d="M14.121 15.121A3 3 0 1 1 9.88 10.88"/>
    </svg>
  );
}
