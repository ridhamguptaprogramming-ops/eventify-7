export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  gamerTag?: string;
  role: UserRole;
  status: 'active' | 'banned';
  rank?: string;
  kdRatio?: number;
  matchesPlayed?: number;
  attendanceStatus?: 'pending' | 'verified';
  createdAt: any;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  speakers: string[];
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  category?: string;
  startDate?: number;
  endDate?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: 'registered' | 'attended';
  registeredAt: any;
  attendedAt?: any;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface Stats {
  totalEvents: number;
  liveEvents: number;
  completedEvents: number;
  totalUsers: number;
}

export interface Tournament {
  id: string;
  gameName: string;
  prizePool: string;
  startDate: number;
  registeredTeamsCount: number;
  bannerImage: string;
  teamSize: number;
  entryFee: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface Team {
  id: string;
  teamName: string;
  captainId: string;
  members: string[];
  logoUrl: string;
  tournamentId: string;
  createdAt: any;
}

export interface Match {
  id: string;
  tournamentId: string;
  teamA: { id: string; name: string; logo?: string };
  teamB: { id: string; name: string; logo?: string };
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  matchStatus: 'upcoming' | 'live' | 'completed';
  scheduledAt: number;
}

export interface Highlight {
  id: string;
  sourceId: string;
  type: 'EVENT' | 'TOURNAMENT';
  title: string;
  description: string;
  imageUrl: string;
  completedAt: number;
  stats?: {
    attendance?: number;
    winner?: string;
    score?: string;
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
