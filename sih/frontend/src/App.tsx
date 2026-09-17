import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './translations';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { NewPatient } from './pages/NewPatient';
import { PatientProfile } from './pages/PatientProfile';
import { NewScreening } from './pages/NewScreening';
import { DoctorReview } from './pages/DoctorReview';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

// App Layout with Sidebar and Header
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Clinical Dashboard', subtitle: "Today's field screening overview" };
      case '/patients':
        return { title: 'Patient Cohort Registry', subtitle: 'Registered rural diabetic population' };
      case '/patients/new':
        return { title: 'Register New Patient', subtitle: 'Primary care demographic intake' };
      case '/screening/new':
        return { title: 'New Retinal Screening', subtitle: 'Quality-first explainable screening workflow' };
      case '/doctor-review':
        return { title: 'Doctor Review Console', subtitle: 'Ophthalmologist verification and triage' };
      case '/history':
        return { title: 'Screening Audit History', subtitle: 'Longitudinal clinical records' };
      case '/reports':
        return { title: 'Clinical Diagnostic Reports', subtitle: 'Official verified patient records' };
      case '/settings':
        return { title: 'System Configuration', subtitle: 'Language, offline storage, and settings' };
      default:
        if (location.pathname.startsWith('/patients/')) {
          return { title: 'Patient Profile & Longitudinal History', subtitle: 'Progression and timeline comparison' };
        }
        return { title: 'RuralEye AI', subtitle: 'SIH 2026' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header 
          title={meta.title} 
          subtitle={meta.subtitle} 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Authentication Page */}
          <Route path="/login" element={<Login />} />

          {/* Clinical Workflows within Authenticated Layout */}
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/patients" element={<DashboardLayout><Patients /></DashboardLayout>} />
          <Route path="/patients/new" element={<DashboardLayout><NewPatient /></DashboardLayout>} />
          <Route path="/patients/:id" element={<DashboardLayout><PatientProfile /></DashboardLayout>} />
          <Route path="/screening/new" element={<DashboardLayout><NewScreening /></DashboardLayout>} />
          <Route path="/doctor-review" element={<DashboardLayout><DoctorReview /></DashboardLayout>} />
          <Route path="/history" element={<DashboardLayout><History /></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
