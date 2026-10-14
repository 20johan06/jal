import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ParticipantLoginPage } from './pages/ParticipantLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ParticipantDashboardPage } from './pages/ParticipantDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Handle route redirection based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (user?.type === 'admin') {
        if (currentView === 'landing' || currentView === 'admin-login' || currentView === 'team-login') {
          setCurrentView('admin-dashboard');
        }
      } else if (user?.type === 'team') {
        if (currentView === 'landing' || currentView === 'team-login' || currentView === 'admin-login') {
          setCurrentView('team-dashboard');
        }
      } else {
        if (currentView === 'team-dashboard' || currentView === 'admin-dashboard') {
          setCurrentView('landing');
        }
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hts-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-8 h-8 animate-spin text-hts-green-400" />
          <span>Initializing HACK THE SYSTEM client...</span>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'team-login':
        return <ParticipantLoginPage onNavigate={setCurrentView} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={setCurrentView} />;
      case 'team-dashboard':
        return user?.type === 'team' ? (
          <ParticipantDashboardPage />
        ) : (
          <ParticipantLoginPage onNavigate={setCurrentView} />
        );
      case 'admin-dashboard':
        return user?.type === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          <AdminLoginPage onNavigate={setCurrentView} />
        );
      case 'landing':
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-hts-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-1">
        {renderView()}
      </main>

      <footer className="bg-hts-navy-900 border-t border-slate-800 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            HACK THE SYSTEM • Think. Decode. Breach.
          </div>
          <div className="text-slate-400">
            SRKR Engineering College • Event Infrastructure v1.0
          </div>
        </div>
      </footer>
    </div>
  );
};
