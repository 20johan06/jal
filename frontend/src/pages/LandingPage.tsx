import React from 'react';
import { Shield, KeyRound, Terminal, Cpu, Users, ChevronRight, Award } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-hts-navy-850 border border-hts-green-500/30 text-hts-green-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>SRKR Engineering College • Official Event Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 font-sans">
          HACK <span className="text-hts-green-400">THE SYSTEM</span>
        </h1>

        <p className="text-lg sm:text-xl font-mono text-slate-300 max-w-2xl mx-auto">
          Think. Decode. Breach.
        </p>

        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          40 elite 4-member teams competing simultaneously. Analyze fictional compromised infrastructure, 
          reconstruct covert forensic trails, and secure your place in the Grand Final.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            id="btn-hero-team-login"
            onClick={() => onNavigate('team-login')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-mono font-semibold text-sm bg-hts-green-500 hover:bg-hts-green-400 text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <KeyRound className="w-4 h-4" />
            <span>Participant Team Login</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="btn-hero-admin-portal"
            onClick={() => onNavigate('admin-login')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-mono font-medium text-sm text-slate-300 bg-hts-navy-850 hover:bg-hts-navy-800 border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-hts-green-400" />
            <span>Organizer Access</span>
          </button>
        </div>
      </div>

      {/* 3 Challenge Levels Overview */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-mono font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-hts-green-400" />
            Investigation Progression
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All teams tackle qualifying rounds simultaneously. Top 6 advance to the Grand Final.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1 */}
          <div className="p-5 rounded-lg bg-hts-navy-900 border border-slate-800 hover:border-hts-green-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  Qualifying Phase
                </span>
                <span className="font-mono text-xs text-slate-500">Round 1</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                1. ACCESS DENIED
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Initial perimeter assessment, header metadata decoding, credential pattern inspection, and initial breach vector identification.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Difficulty: Easy to Medium</span>
              <span>All 40 Teams</span>
            </div>
          </div>

          {/* Level 2 */}
          <div className="p-5 rounded-lg bg-hts-navy-900 border border-slate-800 hover:border-hts-green-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  Qualifying Phase
                </span>
                <span className="font-mono text-xs text-slate-500">Round 2</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                2. PHANTOM TRACE
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Network traffic analysis, forensic server log correlation, obfuscated payload tracking, and lateral movement timeline reconstruction.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Difficulty: Medium to Hard</span>
              <span>All 40 Teams</span>
            </div>
          </div>

          {/* Level 3 */}
          <div className="p-5 rounded-lg bg-hts-navy-900 border border-slate-800 hover:border-hts-green-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-hts-green-950 text-hts-green-400 border border-hts-green-800">
                  Grand Final
                </span>
                <span className="font-mono text-xs text-slate-500">Round 3</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-1.5">
                3. SYSTEM OVERRIDE
                <Award className="w-4 h-4 text-hts-green-400" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-stakes incident investigation and safe programming challenge. Mitigate the breach and decrypt the root recovery artifact.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Difficulty: Hard</span>
              <span className="text-hts-green-400 font-semibold">Top 6 Finalists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Integrity Banner */}
      <div className="p-5 rounded-lg bg-hts-navy-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-hts-navy-850 text-hts-green-400 border border-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200">
              Single Device Participation Protocol
            </h4>
            <p className="text-xs text-slate-400">
              One authenticated laptop per 4-person team. Server-validated submissions with official countdown sync.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-500 text-right shrink-0">
          <div>Platform: Node + Express + MySQL</div>
          <div>All challenge targets strictly fictional</div>
        </div>
      </div>

    </div>
  );
};
