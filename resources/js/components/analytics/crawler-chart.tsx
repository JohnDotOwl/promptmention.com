import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { CrawlerDataPoint, BOT_COLORS } from '@/types/crawler';

interface CrawlerChartProps {
  data: CrawlerDataPoint[];
}

export function CrawlerChart({ data }: CrawlerChartProps) {
  return (
    <Card className="mt-4">
      <div className="p-6 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="#ccc"
              className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              className="text-xs fill-gray-500 dark:fill-gray-500"
              tick={{ fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis 
              className="text-xs fill-gray-500 dark:fill-gray-500"
              tick={{ fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              dx={-3}
            />
            <Tooltip 
              content={CustomTooltip}
              cursor={{ fill: 'transparent' }}
            />
            <Legend 
              content={CustomLegend}
              wrapperStyle={{
                position: 'relative',
                paddingTop: '0px',
                paddingBottom: '10px',
                marginTop: '-30px'
              }}
            />
            <Bar dataKey="googlebot" stackId="a" fill={BOT_COLORS.googlebot} />
            <Bar dataKey="bingbot" stackId="a" fill={BOT_COLORS.bingbot} />
            <Bar dataKey="openaiBot" stackId="a" fill={BOT_COLORS.openaiBot} />
            <Bar dataKey="perplexityBot" stackId="a" fill={BOT_COLORS.perplexityBot} />
            <Bar dataKey="googleOtherBot" stackId="a" fill={BOT_COLORS.googleOtherBot} />
            <Bar dataKey="genericBot" stackId="a" fill={BOT_COLORS.genericBot} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="font-semibold mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.fill }}
            />
            <span className="capitalize">{formatBotName(entry.dataKey)}:</span>
            <span className="font-medium ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total:</span>
          <span>{payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}</span>
        </div>
      </div>
    </div>
  );
}

function CustomLegend() {
  const items = [
    { name: 'Googlebot', color: BOT_COLORS.googlebot },
    { name: 'Bingbot', color: BOT_COLORS.bingbot },
    { name: 'OpenAI Bot', color: BOT_COLORS.openaiBot },
    { name: 'PerplexityBot', color: BOT_COLORS.perplexityBot },
    { name: 'GoogleOtherBot', color: BOT_COLORS.googleOtherBot },
    { name: 'Generic Bot', color: BOT_COLORS.genericBot },
  ];

  return (
    <div className="flex items-center justify-end">
      <ol className="relative overflow-hidden">
        <div className="flex h-full flex-wrap">
          {items.map((item) => (
            <li
              key={item.name}
              className="group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition cursor-default"
            >
              <span
                className="size-2 shrink-0 rounded-sm opacity-100"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <p className="truncate whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 opacity-100">
                {item.name}
              </p>
            </li>
          ))}
        </div>
      </ol>
    </div>
  );
}

function formatBotName(key: string): string {
  const names: Record<string, string> = {
    googlebot: 'Googlebot',
    bingbot: 'Bingbot',
    openaiBot: 'OpenAI Bot',
    perplexityBot: 'PerplexityBot',
    googleOtherBot: 'GoogleOtherBot',
    genericBot: 'Generic Bot',
  };
  return names[key] || key;
}