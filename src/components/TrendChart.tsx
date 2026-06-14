import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTrendData } from '@/hooks/useHabitStats';
import type { Habit, CheckIn } from '@/types';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
  habits: Habit[];
  checkIns: CheckIn[];
  days?: number;
}

export const TrendChart = ({ habits, checkIns, days = 14 }: TrendChartProps) => {
  const data = useTrendData(habits, checkIns, days);
  const avgCompletion = data.length > 0
    ? Math.round(data.reduce((acc, d) => acc + d.completion, 0) / data.length)
    : 0;

  return (
    <div className="card p-5 animate-fade-in-up stagger-2" style={{ animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-grad-secondary flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">完成趋势</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">最近 {days} 天整体完成率</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-grad-secondary bg-clip-text text-transparent">
            {avgCompletion}%
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">平均完成率</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
              axisLine={{ stroke: 'rgb(var(--border))' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgb(var(--card))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '12px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)'
              }}
              formatter={(value: number) => [`${value}%`, '完成率']}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              cursor={{ stroke: '#4ECDC4', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#4ECDC4"
              strokeWidth={2.5}
              fill="url(#colorCompletion)"
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#4ECDC4' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
