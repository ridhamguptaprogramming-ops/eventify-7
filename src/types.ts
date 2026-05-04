export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
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
  registeredAt: number;
  attendedAt?: number;
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
