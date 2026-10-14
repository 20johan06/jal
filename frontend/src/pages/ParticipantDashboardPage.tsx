import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Round } from '../types/index';
import { Timer } from '../components/Timer';
import { Users, Award, Shield, CheckCircle, Lock, RefreshCw, AlertCircle, FileText } from 'lucide-react';

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    serverTime: string;
    team: any;
    stats: { score: number; submissions: number };
    rounds: Round[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await api.getTeamDashboard();
      if (res.success) {
        setDashboardData({
          serverTime: res.serverTime,
          team: res.team,
          stats: res.stats,
          rounds: res.rounds
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to synchronize dashboard state.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);

    // Periodic polling every 10 seconds for round activations
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-hts-green-400" />
          <span>Synchronizing team environment with server...</span>
        </div>
      </div>
    );
  }

  const activeRound = dashboardData?.rounds?.find(r => r.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Team Identity & Live Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Card (2 cols on LG) */}
        <div className="lg:col-span-2 bg-hts-navy-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-hts-green-500" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-hts-navy-800 text-hts-green-400 border border-hts-green-500/30">
                  {dashboardData?.team?.team_id || user?.teamId}
                </span>
                {dashboardData?.team?.is_qualified ? (
                  <span className="inline-flex items-center gap-1 font-mono text-xs uppercase px-2 py-0.5 rounded bg-hts-green-950 text-hts-green-400 border border-hts-green-800">
                    <Award className="w-3.5 h-3.5" /> Grand Final Qualifier
                  </span>
                ) : (
                  <span className="font-mono text-xs text-slate-400">
                    Active Contender
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-mono font-bold text-slate-100">
                {dashboardData?.team?.team_name || user?.teamName}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Team Roster: 4 Registered Members</span>
              </p>
            </div>

            {/* Score & Submissions Badges */}
            <div className="flex items-center gap-4 bg-hts-navy-850 p-3 rounded-lg border border-slate-700/80">
              <div className="text-center px-2">
                <div className="text-xs font-mono uppercase text-slate-400">Current Score</div>
                <div className="text-2xl font-mono font-bold text-hts-green-400">
                  {dashboardData?.stats?.score || 0}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs font-mono uppercase text-slate-400">Submissions</div>
                <div className="text-2xl font-mono font-bold text-slate-200">
                  {dashboardData?.stats?.submissions || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Terminal: SRKR Campus Local Node</span>
            <button
              onClick={() => loadDashboard(false)}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-hts-green-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-hts-green-400' : ''}`} />
              <span>Sync Status</span>
            </button>
          </div>
        </div>

        {/* Live Timer Card */}
        <div className="lg:col-span-1">
          <Timer
            endTime={activeRound?.end_time}
            serverTime={dashboardData?.serverTime}
            status={activeRound ? activeRound.status : 'STANDBY'}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-hts-crimson/10 border border-hts-crimson/40 text-hts-crimson text-xs flex items-center gap-3 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Challenge Rounds Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-mono font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-hts-green-400" />
              Challenge Progression Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Stages are authorized and unlocked centrally by the event organizers.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Phase 1 Foundation Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData?.rounds?.map((round, idx) => {
            const isRoundActive = round.status === 'ACTIVE';
            const isRoundEnded = round.status === 'ENDED';

            return (
              <div 
                key={round.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isRoundActive
                    ? 'bg-hts-navy-850 border-hts-green-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-hts-green-500/40'
                    : isRoundEnded
                    ? 'bg-hts-navy-900/80 border-slate-800 opacity-75'
                    : 'bg-hts-navy-900 border-slate-800/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">
                      LEVEL 0{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isRoundActive
                        ? 'bg-hts-green-500/20 text-hts-green-400 border border-hts-green-500/30 animate-pulse'
                        : isRoundEnded
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {round.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-mono font-bold text-slate-100">
                      {round.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {round.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">
                    Duration: {round.duration_minutes}m
                  </span>
                  {isRoundActive ? (
                    <button
                      id={`btn-open-round-${round.round_key}`}
                      className="px-3 py-1.5 rounded bg-hts-green-500 hover:bg-hts-green-400 text-black font-mono font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Evidence</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>{isRoundEnded ? 'Stage Concluded' : 'Awaiting Unlock'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Callout / Ready Notice */}
      <div className="p-6 rounded-xl bg-hts-navy-900/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-hts-green-400" />
            <span className="font-mono text-sm font-semibold text-slate-200">
              Participant Terminal Connected & Authenticated
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Your single laptop session is securely linked. When organizers unlock ACCESS DENIED, 
            the evidence cards, packet captures, and answer submission inputs will appear immediately without requiring re-login.
          </p>
        </div>

        <div className="px-4 py-2 rounded bg-hts-navy-850 border border-slate-700 font-mono text-xs text-slate-300 shrink-0">
          Auto-polling: <span className="text-hts-green-400">Active (10s)</span>
        </div>
      </div>

    </div>
  );
};
