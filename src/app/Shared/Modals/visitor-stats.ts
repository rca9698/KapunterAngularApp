export interface VisitorLoginLog {
  loginId: number;
  userId: number;
  userNumber: string;
  role: string;
  loginAt: string;
}

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  weekVisits: number;
  lastUpdated?: string;
  recentLogins?: VisitorLoginLog[];
}
