import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCompareData } from '@/hooks/useHabitStats';
import type { Habit, CheckIn } from '@/types';
import { BarChart3 } from 'lucide-react';

interface CompareChartProps {
  habits: Habit[];
  checkIns: CheckIn[];
}

export const CompareChart = ({ habits, checkIns }: CompareChartProps) => {
  const data = useCompareData(habits, checkIns);

  return (
    <div className="card p-5 animate-fade-in-up stagger-3" style={{ animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-grad-accent flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">习惯对比</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">本月各习惯完成率</p>
          </div>
        </div>
      </div>

      <div className="h-48">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            暂无数据，添加习惯后查看对比
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.2)"
                horizontal={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
                axisLine={{ stroke: 'rgb(var(--border))' }}
                tickLine={false}
                interval={0}
                tickFormatter={(v) => v.length > 6 ? v.substring(0, 6) + '…' : v}
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
                cursor={{ fill: 'rgba(78, 205, 196, 0.1)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 2px 4px ${entry.color}40)` }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
