export type BotName = 'Googlebot' | 'Bingbot' | 'OpenAI Bot' | 'PerplexityBot' | 'GoogleOtherBot' | 'Generic Bot';

export interface CrawlerDataPoint {
  timestamp: string;
  date: string;
  googlebot: number;
  bingbot: number;
  openaiBot: number;
  perplexityBot: number;
  googleOtherBot: number;
  genericBot: number;
  total: number;
}

export interface CrawlerLog {
  id: string;
  timestamp: string;
  botName: BotName;
  ipAddress: string;
  userAgent: string;
  path: string;
  status: number;
}

export interface CrawlerStats {
  totalRequests: number;
  uniqueBots: number;
  errorRate: number;
  topPath: string;
}

export const BOT_COLORS: Record<string, string> = {
  googlebot: '#3b82f6',      // blue-500
  bingbot: '#10b981',        // green-500
  openaiBot: '#a855f7',      // purple-500
  perplexityBot: '#d946ef',  // fuchsia-500
  googleOtherBot: '#06b6d4', // cyan-500
  genericBot: '#f97316',     // orange-500
};

export const BOT_ICONS: Record<BotName, string> = {
  'Googlebot': '/llm-icons/google.svg',
  'Bingbot': '/llm-icons/bing.svg',
  'OpenAI Bot': '/llm-icons/openai.svg',
  'PerplexityBot': '/llm-icons/perplexity.svg',
  'GoogleOtherBot': '/llm-icons/google.svg',
  'Generic Bot': '/llm-icons/generic.svg',
};