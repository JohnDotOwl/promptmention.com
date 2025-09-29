import { CrawlerDataPoint, CrawlerLog, BotName } from '@/types/crawler';
import { format, subDays } from 'date-fns';

const BOT_NAMES: BotName[] = ['Googlebot', 'Bingbot', 'OpenAI Bot'];
const PATHS = ['/', '/about', '/blog/post-1'];
const STATUS_CODES = [200, 200, 200, 200, 301, 404, 500]; // Weighted towards 200

export function generateCrawlerData(days: number): CrawlerDataPoint[] {
  const data: CrawlerDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM d');
    
    const googlebot = Math.floor(Math.random() * 40) + 10;
    const bingbot = Math.floor(Math.random() * 30) + 5;
    const openaiBot = Math.floor(Math.random() * 35) + 15;
    const perplexityBot = Math.floor(Math.random() * 20) + 5;
    const googleOtherBot = Math.floor(Math.random() * 25) + 5;
    const genericBot = Math.floor(Math.random() * 15) + 5;
    
    data.push({
      timestamp: date.toISOString(),
      date: dateStr,
      googlebot,
      bingbot,
      openaiBot,
      perplexityBot,
      googleOtherBot,
      genericBot,
      total: googlebot + bingbot + openaiBot + perplexityBot + googleOtherBot + genericBot,
    });
  }
  
  return data;
}

export function generateCrawlerLogs(count: number): CrawlerLog[] {
  const logs: CrawlerLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(Math.random() * 1440); // Up to 24 hours ago
    const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const path = PATHS[Math.floor(Math.random() * PATHS.length)];
    const status = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
    
    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      botName,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 200) + 1}`,
      userAgent: generateUserAgent(botName),
      path,
      status,
    });
  }
  
  // Sort by timestamp descending (most recent first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateUserAgent(botName: BotName): string {
  const version = (Math.random() * 0.99).toFixed(2);
  
  switch (botName) {
    case 'Googlebot':
      return `Googlebot/${version} (+http://www.example.com/bot.html)`;
    case 'Bingbot':
      return `bingbot/${version} (+http://www.example.com/bot.html)`;
    case 'OpenAI Bot':
      return `ChatGPT-User/${version} (+http://www.example.com/bot.html)`;
    case 'PerplexityBot':
      return `PerplexityBot/${version} (+http://www.example.com/bot.html)`;
    case 'GoogleOtherBot':
      return `GoogleOther/${version} (+http://www.example.com/bot.html)`;
    case 'Generic Bot':
      return `Mozilla/5.0 (compatible; GenericBot/${version}; +http://www.example.com/bot.html)`;
    default:
      return `Bot/${version}`;
  }
}