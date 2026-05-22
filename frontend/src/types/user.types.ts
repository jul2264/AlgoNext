// AlgoNext — User Types

export interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProgress {
  userId: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string;
}

export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  favoriteLanguage: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'submission' | 'achievement' | 'streak';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
