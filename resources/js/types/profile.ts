export interface User {
  name: string | null;
  email: string | null;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
  jobRole: string | null;
  companySize: string | null;
  language: string | null;
  country: string | null;
  referralSource: string | null;
}

export interface Company {
  name: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  websiteAnalysis?: {
    title?: string;
    description?: string;
    industry?: string;
  } | null;
}

export interface DomainAnalysis {
  summary: string | null;
  industry: string | null;
  keywords: string[];
  competitors: Competitor[];
  analysisData: any;
  status: string;
  processedAt: string | null;
  createdAt: string | null;
}

export interface Competitor {
  name: string;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  source?: string;
  monitorName?: string;
}

export interface ProfileMonitor {
  id: number | string;
  name: string;
  website: {
    name: string;
    url: string;
  };
  status: string;
  createdAt: string;
}

export interface ProfilePageProps {
  user: User;
  company: Company;
  domainAnalysis: DomainAnalysis | null;
  monitors: ProfileMonitor[];
  onboardingCompleted: boolean;
  hasData: boolean;
}