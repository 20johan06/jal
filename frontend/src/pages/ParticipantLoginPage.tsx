import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

interface ParticipantLoginPageProps {
  onNavigate: (view: string) => void;
}

export const ParticipantLoginPage: React.FC<ParticipantLoginPageProps> = ({ onNavigate }) => {
  const { loginTeam } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamId.trim() || !password) {
      setError('Please provide both Team ID and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginTeam({ teamId: teamId.trim(), password });
      onNavigate('team-dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hts-green-600 via-hts-green-400 to-transparent" />

          <div className="space-y-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-hts-navy-800 border border-slate-700 flex items-center justify-center text-hts-green-400 mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              Team Authentication
            </h2>
            <p className="text-xs text-slate-400">
              Enter your assigned Team ID and password to access your investigation dashboard.
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
                htmlFor="team-id-input"
                className="block text-xs font-mono uppercase text-slate-300 mb-1.5"
              >
                Team Identifier
              </label>
              <input
                id="team-id-input"
                type="text"
                autoComplete="username"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="e.g. TEAM-01"
                className="w-full px-3.5 py-2.5 rounded-lg bg-hts-navy-850 border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-hts-green-500 focus:ring-1 focus:ring-hts-green-500 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label 
                htmlFor="team-password-input"
                className="block text-xs font-mono uppercase text-slate-300 mb-1.5"
              >
                Access Password
              </label>
              <input
                id="team-password-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-hts-navy-850 border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-hts-green-500 focus:ring-1 focus:ring-hts-green-500 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <button
              id="btn-team-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-hts-green-500 hover:bg-hts-green-400 text-black font-mono font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enter Participant Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Need assistance with your team credentials? Contact the SRKR event coordinators desk.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
