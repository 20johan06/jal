import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Team, Round, AdminStats, AuditLog } from '../types/index';
import { 
  Users, 
  Shield, 
  Award, 
  Plus, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  ListFilter,
  AlertCircle,
  FileCheck2,
  Trash2,
  X
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New Team Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTeamId, setNewTeamId] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [newMemberCount, setNewMemberCount] = useState(4);
  const [newMemberNames, setNewMemberNames] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async (initial = false) => {
    if (initial) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const [statsRes, teamsRes, roundsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTeams(),
        api.getAdminRounds(),
        api.getAuditLogs()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (teamsRes.success) setTeams(teamsRes.teams);
      if (roundsRes.success) setRounds(roundsRes.rounds);
      if (logsRes.success) setAuditLogs(logsRes.logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative console state.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!newTeamId.trim() || !newTeamName.trim() || !newTeamPassword) {
      setModalError('Please fill in Team ID, Team Name, and Password.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createTeam({
        teamId: newTeamId.trim().toUpperCase(),
        teamName: newTeamName.trim(),
        password: newTeamPassword,
        memberCount: newMemberCount,
        memberNames: newMemberNames.trim() || undefined
      });

      if (res.success) {
        setModalSuccess(`Team '${res.team.teamId}' successfully registered.`);
        setNewTeamId('');
        setNewTeamName('');
        setNewTeamPassword('');
        setNewMemberNames('');
        await loadData(false);
        setTimeout(() => {
          setShowModal(false);
          setModalSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to register team account.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (id: number, teamId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete team '${teamId}'? This will also remove any associated records.`)) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      const res = await api.deleteTeam(id);
      if (res.success) {
        setActionFeedback(`Team '${teamId}' deleted successfully.`);
        await loadData(false);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete team.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.team_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-hts-green-400" />
          <span>Loading Organizer Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-blue-950 text-blue-400 border border-blue-800 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>SRKR Organizer Control Center</span>
          </div>
          <h1 className="text-2xl font-mono font-bold text-slate-100">
            Event Administration Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for 40 participating teams, challenge rounds, and scoring integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-hts-navy-850 hover:bg-hts-navy-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-hts-green-400' : ''}`} />
            <span>Refresh State</span>
          </button>

          <button
            id="btn-open-create-team-modal"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-hts-green-500 hover:bg-hts-green-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Team</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-hts-crimson/10 border border-hts-crimson/40 text-hts-crimson text-xs flex items-center gap-3 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionFeedback && (
        <div className="p-4 rounded-lg bg-hts-green-950/60 border border-hts-green-800 text-hts-green-400 text-xs flex items-center gap-3 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-hts-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>REGISTERED TEAMS</span>
            <Users className="w-4 h-4 text-hts-green-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {stats?.totalTeams || 0}
            <span className="text-xs text-slate-500 font-normal ml-2">/ 40 Target</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hts-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE ROUNDS</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {stats?.activeRounds || 0}
            <span className="text-xs text-slate-500 font-normal ml-2">/ 3 Total</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hts-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SUBMISSIONS</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {stats?.totalSubmissions || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hts-navy-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>QUALIFIED FINALISTS</span>
            <Award className="w-4 h-4 text-hts-green-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {stats?.qualifiedTeams || 0}
            <span className="text-xs text-slate-500 font-normal ml-2">/ 6 Max</span>
          </div>
        </div>
      </div>

      {/* Rounds Status Summary */}
      <div className="bg-hts-navy-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-hts-green-400" />
          Event Rounds Configuration (Phase 1 Baseline)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rounds.map((round) => (
            <div key={round.id} className="p-4 rounded-lg bg-hts-navy-850 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{round.round_key}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  round.status === 'ACTIVE'
                    ? 'bg-hts-green-500/20 text-hts-green-400 border border-hts-green-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {round.status}
                </span>
              </div>
              <div className="font-mono font-semibold text-sm text-slate-200">{round.title}</div>
              <div className="text-xs text-slate-400">{round.subtitle}</div>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                Duration: {round.duration_minutes} mins
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Roster Management */}
      <div className="bg-hts-navy-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-hts-green-400" />
              Participating Teams ({teams.length})
            </h2>
            <p className="text-xs text-slate-400">
              Accounts and credentials for laptop authentication. Passwords are encrypted with bcrypt.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team ID / name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-hts-navy-850 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hts-green-500"
            />
          </div>
        </div>

        {/* Teams Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-hts-navy-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Team ID</th>
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Finalist</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No teams found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-hts-navy-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-hts-green-400">{t.team_id}</td>
                    <td className="py-3 px-4 text-slate-100 font-semibold">{t.team_name}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {t.member_count} ({t.member_names || 'Standard Squad'})
                    </td>
                    <td className="py-3 px-4">
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-hts-green-400 bg-hts-green-950/60 px-2 py-0.5 rounded border border-hts-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {t.is_qualified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-hts-green-400 font-bold">
                          <Award className="w-3.5 h-3.5" /> Top 6
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        id={`btn-delete-team-${t.id}`}
                        onClick={() => handleDeleteTeam(t.id, t.team_id)}
                        disabled={deletingId === t.id}
                        className="p-1.5 rounded text-slate-400 hover:text-hts-crimson hover:bg-hts-crimson/10 border border-transparent hover:border-hts-crimson/30 transition-colors disabled:opacity-50"
                        title={`Delete team ${t.team_id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-hts-navy-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-blue-400" />
          Security Audit Trail (Latest Actions)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-hts-navy-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-hts-navy-850/40">
                  <td className="py-2 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    <span className="text-hts-green-400">[{log.actor_type}]</span> {log.actor_id}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-200">{log.action}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Team Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-hts-navy-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h3 className="text-lg font-mono font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-hts-green-400" />
                Register Team Account
              </h3>
              <p className="text-xs text-slate-400">
                Create a participant team login for the competition laptop.
              </p>
            </div>

            {modalSuccess && (
              <div className="mb-4 p-3 rounded bg-hts-green-950/60 border border-hts-green-800 text-hts-green-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="mb-4 p-3 rounded bg-hts-crimson/10 border border-hts-crimson/40 text-hts-crimson text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Team Identifier (e.g. TEAM-03)
                </label>
                <input
                  type="text"
                  value={newTeamId}
                  onChange={(e) => setNewTeamId(e.target.value)}
                  placeholder="TEAM-XX"
                  className="w-full px-3 py-2 rounded bg-hts-navy-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-hts-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Cipher Wardens"
                  className="w-full px-3 py-2 rounded bg-hts-navy-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-hts-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newTeamPassword}
                  onChange={(e) => setNewTeamPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded bg-hts-navy-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-hts-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Member Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newMemberCount}
                  onChange={(e) => setNewMemberCount(parseInt(e.target.value, 10) || 4)}
                  className="w-full px-3 py-2 rounded bg-hts-navy-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-hts-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">
                  Member Names (Comma separated)
                </label>
                <input
                  type="text"
                  value={newMemberNames}
                  onChange={(e) => setNewMemberNames(e.target.value)}
                  placeholder="Member 1, Member 2, Member 3, Member 4"
                  className="w-full px-3 py-2 rounded bg-hts-navy-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-hts-green-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded bg-hts-navy-850 hover:bg-hts-navy-800 text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded bg-hts-green-500 hover:bg-hts-green-400 text-black font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Register Team</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
