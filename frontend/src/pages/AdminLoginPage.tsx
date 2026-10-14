import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ArrowLeft, Loader2, Lock } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide administrative username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAdmin({ username: username.trim(), password });
      onNavigate('admin-dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrative login rejected. Check username and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Navigation Back */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Home
        </button>

        {/* Card */}
        <div className="bg-hts-navy-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-400 to-transparent" />

          <div className="space-y-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-hts-navy-850 border border-slate-700 flex items-center justify-center text-blue-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              Organizer Portal
            </h2>
            <p className="text-xs text-slate-400">
              Authorized event organizers only. Access round controls, team rosters, and real-time event scoring.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-md bg-hts-crimson/10 border border-hts-crimson/40 text-hts-crimson text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="admin-username-input"
                className="block text-xs font-mono uppercase text-slate-300 mb-1.5"
              >
                Organizer Username
              </label>
              <input
                id="admin-username-input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-3.5 py-2.5 rounded-lg bg-hts-navy-850 border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label 
                htmlFor="admin-password-input"
                className="block text-xs font-mono uppercase text-slate-300 mb-1.5"
              >
                Security Key / Password
              </label>
              <input
                id="admin-password-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-hts-navy-850 border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <button
              id="btn-admin-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-slate-100 hover:bg-white text-black font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Organizer Privileges...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter Organizer Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              All administrative sign-ins and operational actions are logged for auditing purposes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
