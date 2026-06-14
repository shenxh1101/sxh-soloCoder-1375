import { Target, CheckCircle2, Calendar, Award } from 'lucide-react';
import { useOverallStats } from '@/hooks/useHabitStats';
import type { Habit, CheckIn, Badge } from '@/types';

interface StatsOverviewProps {
  habits: Habit[];
  checkIns: CheckIn[];
  badges: Badge[];
}

const statConfigs = [
  {
    icon: Target,
    label: '总习惯数',
    gradient: 'from-brand-500 to-warm-500',
    bgGradient: 'from-brand-50 to-warm-50 dark:from-brand-900/20 dark:to-warm-900/20',
    key: 'totalHabits' as const,
    unit: '个'
  },
  {
    icon: CheckCircle2,
    label: '今日完成',
    gradient: 'from-accent-500 to-blue-500',
    bgGradient: 'from-accent-50 to-blue-50 dark:from-accent-900/20 dark:to-blue-900/20',
    key: 'todayCompleted' as const,
    unit: '项'
  },
  {
    icon: Calendar,
    label: '累计打卡',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    key: 'totalCheckInDays' as const,
    unit: '天'
  },
  {
    icon: Award,
    label: '获得徽章',
    gradient: 'from-violet-500 to-fuchsia-500',
    bgGradient: 'from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20',
    key: 'totalBadges' as const,
    unit: '枚'
  }
];

export const StatsOverview = ({ habits, checkIns, badges }: StatsOverviewProps) => {
  const stats = useOverallStats(habits, checkIns, badges);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((config, index) => {
        const Icon = config.icon;
        const value = stats[config.key];
        const total = config.key === 'todayCompleted' ? stats.totalHabits : null;

        return (
          <div
            key={config.label}
            className={`card p-5 bg-gradient-to-br ${config.bgGradient} animate-fade-in-up stagger-${index + 1}`}
            style={{ animationFillMode: 'both' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-soft`}>
                <Icon size={22} className="text-white" />
              </div>
              {total !== null && total > 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {value}/{total}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                  {value}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {config.unit}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {config.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
