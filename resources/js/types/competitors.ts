import { Competitor, ProfileMonitor } from './profile';

export interface UserCompany {
  company: {
    name: string | null;
    website: string | null;
    industry: string | null;
  };
}

export interface CompetitorStats {
  totalCompetitors: number;
  activeMonitors: number;
  totalMonitorCompetitors: number;
  monitorsCount: number;
}

export interface DomainAnalysisData {
  summary: string | null;
  keywords: string[];
  status: string;
  processedAt: string | null;
}

export interface CompetitorsPageProps {
  user: UserCompany;
  competitors: Competitor[];
  stats: CompetitorStats;
  domainAnalysis: DomainAnalysisData | null;
  monitors: ProfileMonitor[];
  onboardingCompleted: boolean;
  hasData: boolean;
}