export type UserType = 'admin' | 'team';

export interface AuthUser {
  type: UserType;
  id: number;
  username?: string;
  role?: string;
  teamId?: string;
  teamName?: string;
  isQualified?: boolean;
}

export interface Team {
  id: number;
  team_id: string;
  team_name: string;
  member_count: number;
  member_names?: string;
  is_active: boolean;
  is_qualified: boolean;
  created_at: string;
}

export type RoundStatus = 'LOCKED' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Round {
  id: number;
  round_key: string;
  title: string;
  subtitle: string;
  round_order: number;
  status: RoundStatus;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
}

export interface AdminStats {
  totalTeams: number;
  activeRounds: number;
  totalSubmissions: number;
  qualifiedTeams: number;
}

export interface TeamDashboardData {
  serverTime: string;
  team: {
    id: number;
    team_id: string;
    team_name: string;
    member_count: number;
    member_names?: string | null;
    is_active: number | boolean;
    is_qualified: number | boolean;
  };
  stats: {
    score: number;
    submissions: number;
  };
  rounds: Round[];
}

export interface AuditLog {
  id: number;
  actor_type: string;
  actor_id: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
