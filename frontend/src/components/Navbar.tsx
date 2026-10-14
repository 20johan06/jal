import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Terminal, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-hts-navy-900 border-b border-hts-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded bg-hts-navy-800 border border-hts-green-500/30 flex items-center justify-center text-hts-green-400 group-hover:border-hts-green-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-slate-100 text-lg">
                HACK<span className="text-hts-green-400">THE</span>SYSTEM
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-hts-navy-800 text-slate-300 border border-slate-700">
                <Radio className="w-2.5 h-2.5 text-hts-green-400 animate-pulse" /> SRKR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
              Think. Decode. Breach.
            </p>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Identity Badge */}
              <div className="px-3 py-1.5 rounded bg-hts-navy-850 border border-slate-700/80 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-hts-green-400" />
                <div className="text-xs">
                  {user.type === 'admin' ? (
                    <span className="font-mono text-hts-green-400 font-semibold">
                      ORGANIZER: {user.username}
                    </span>
                  ) : (
                    <span className="font-mono text-slate-200">
                      <span className="text-hts-green-400 font-semibold">{user.teamId}</span>
                      {user.teamName && <span className="text-slate-400"> • {user.teamName}</span>}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-300 bg-hts-navy-800 hover:bg-hts-crimson/20 hover:text-hts-crimson border border-slate-700 hover:border-hts-crimson/50 transition-colors flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-team-login"
                onClick={() => onNavigate('team-login')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  currentView === 'team-login'
                    ? 'bg-hts-green-500 text-black font-semibold'
                    : 'text-slate-200 bg-hts-navy-850 hover:bg-hts-navy-800 border border-slate-700'
                }`}
              >
                Team Login
              </button>
              <button
                id="nav-admin-login"
                onClick={() => onNavigate('admin-login')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  currentView === 'admin-login'
                    ? 'bg-slate-200 text-black font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-hts-navy-850 border border-transparent'
                }`}
              >
                Organizer
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
