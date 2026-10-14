-- Database Schema for HACK THE SYSTEM
-- Event: Think. Decode. Breach. (SRKR Engineering College)

CREATE DATABASE IF NOT EXISTS hack_the_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hack_the_system;

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teams Table (~40 teams, 4 members/team)
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(32) NOT NULL UNIQUE,
  team_name VARCHAR(128) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  member_count INT NOT NULL DEFAULT 4,
  member_names TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_team_id (team_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rounds Table (ACCESS DENIED, PHANTOM TRACE, SYSTEM OVERRIDE)
CREATE TABLE IF NOT EXISTS rounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  round_key VARCHAR(32) NOT NULL UNIQUE,
  title VARCHAR(128) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  round_order INT NOT NULL DEFAULT 1,
  status ENUM('LOCKED', 'ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'LOCKED',
  duration_minutes INT NOT NULL DEFAULT 45,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_round_key (round_key),
  INDEX idx_round_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  round_id INT NOT NULL,
  challenge_key VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL DEFAULT 100,
  max_attempts INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
  INDEX idx_challenge_round (round_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  challenge_id INT NOT NULL,
  submitted_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  points_awarded INT NOT NULL DEFAULT 0,
  review_status ENUM('AUTOMATIC', 'PENDING_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'AUTOMATIC',
  reviewer_notes TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  INDEX idx_team_submissions (team_id),
  INDEX idx_challenge_submissions (challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_type ENUM('ADMIN', 'TEAM', 'SYSTEM') NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_type, actor_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
