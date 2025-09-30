import { DeviceData } from '@/types/analytics'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface LegendEntry {
  payload?: {
    device: string;
    percentage: number;
  };
}

interface DeviceBreakdownCardProps {
  data: DeviceData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

export function DeviceBreakdownCard({ data }: DeviceBreakdownCardProps) {
  return (
    <div className="h-[495px] space-y-4 border-r border-b p-8">
      <div>
        <h2 className="text-base font-semibold leading-none">Device Breakdown</h2>
      </div>
      <div className="h-full">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="percentage"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string, entry: LegendEntry) => {
                if (entry && entry.payload) {
                  return (
                    <span className="text-sm">
                      {entry.payload.device}: {entry.payload.percentage}%
                    </span>
                  );
                }
                return <span className="text-sm">{value}</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-4">
          {data.map((item, index) => (
            <div key={item.device} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm">{item.device}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {(item.count / 1000).toFixed(1)}k users
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}