import { AuthUser, Team, Round, AdminStats, AuditLog } from '../types/index';

// Resolve API base URL with fallback to '/api' (matching Vite proxy)
function resolveApiBase(envUrl?: string): string {
  const url = (envUrl || '').trim();
  if (!url) return '/api';
  // Strip trailing slashes
  const cleanUrl = url.replace(/\/+$/, '');
  // Ensure /api suffix exists without duplicating it
  if (!cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/api`;
  }
  return cleanUrl;
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_URL);

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('hts_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Invalid response from server'
    }));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // --- Auth Endpoints ---
  async adminLogin(credentials: { username: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: AuthUser }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async teamLogin(credentials: { teamId: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: AuthUser }>('/auth/team/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getMe() {
    return this.request<{ success: boolean; user: AuthUser }>('/auth/me');
  }

  // --- Participant Endpoints ---
  async getTeamDashboard() {
    return this.request<{ success: boolean; serverTime: string; team: any; stats: any; rounds: Round[] }>('/team/dashboard');
  }

  // --- Admin Endpoints ---
  async getAdminStats() {
    return this.request<{ success: boolean; stats: AdminStats }>('/admin/stats');
  }

  async getAdminTeams() {
    return this.request<{ success: boolean; teams: Team[] }>('/admin/teams');
  }

  async createTeam(teamData: {
    teamId: string;
    teamName: string;
    password: string;
    memberCount: number;
    memberNames?: string;
  }) {
    return this.request<{ success: boolean; message: string; team: any }>('/admin/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async getAdminRounds() {
    return this.request<{ success: boolean; rounds: Round[] }>('/admin/rounds');
  }

  async getAuditLogs() {
    return this.request<{ success: boolean; logs: AuditLog[] }>('/admin/audit-logs');
  }
}

export const api = new ApiService();
