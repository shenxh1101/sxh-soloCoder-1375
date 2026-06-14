import { X, Sparkles, Flame, Trophy, Crown, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Badge, Habit } from '@/types';
import { BADGE_CONFIG, type BadgeType } from '@/types';
import { formatDisplayDate } from '@/utils/date';

interface BadgeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  habits: Habit[];
}

const iconMap: Record<string, any> = {
  Sparkles,
  Flame,
  Trophy,
  Crown
};

export const BadgeGallery = ({ isOpen, onClose, badges, habits }: BadgeGalleryProps) => {
  if (!isOpen) return null;

  const allBadgeTypes: BadgeType[] = ['first_checkin', 'streak_7', 'streak_30', 'monthly_perfect'];
  const unlockedCount = badges.length;
  const totalPossible = allBadgeTypes.length * Math.max(habits.length, 1);
  const progress = totalPossible > 0 ? Math.round((unlockedCount / (allBadgeTypes.length * habits.length)) * 100) : 0;

  const getHabitName = (habitId: string) => {
    return habits.find(h => h.id === habitId)?.name || '未知习惯';
  };

  const getHabitColor = (habitId: string) => {
    return habits.find(h => h.id === habitId)?.color || '#4ECDC4';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg animate-bounce-in">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-warm-500/10 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="text-warm-500" size={24} />
                徽章墙
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                收集徽章，记录你的成长足迹
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-white/60 dark:bg-slate-700/40 border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">收集进度</span>
              <span className="text-sm font-bold bg-grad-accent bg-clip-text text-transparent">
                {unlockedCount} / {allBadgeTypes.length * habits.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
              <div
                className="h-full bg-grad-accent transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {habits.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                还没有添加习惯，创建习惯后即可解锁徽章
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {habits.map((habit) => (
                <div key={habit.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {(() => {
                        const Icon = (LucideIcons as any)[habit.icon];
                        return Icon ? <Icon size={14} style={{ color: habit.color }} /> : null;
                      })()}
                    </div>
                    <h3 className="font-semibold text-sm">{habit.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allBadgeTypes.map((type) => {
                      const config = BADGE_CONFIG[type];
                      const badge = badges.find(b => b.habitId === habit.id && b.type === type);
                      const Icon = iconMap[config.icon] || Sparkles;
                      const isUnlocked = !!badge;
                      const color = getHabitColor(habit.id);

                      return (
                        <div
                          key={type}
                          className={`relative rounded-xl p-4 text-center transition-all ${isUnlocked
                              ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 shadow-soft hover:shadow-soft-lg hover:-translate-y-1'
                              : 'bg-slate-50 dark:bg-slate-700/30 border border-dashed border-slate-200 dark:border-slate-600'
                            }`}
                        >
                          <div
                            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${isUnlocked
                                ? 'animate-bounce-in'
                                : ''
                              }`}
                            style={{
                              background: isUnlocked
                                ? `linear-gradient(135deg, ${color}20, ${color}40)`
                                : 'rgb(var(--muted))'
                            }}
                          >
                            {isUnlocked ? (
                              <Icon size={28} style={{ color }} />
                            ) : (
                              <Lock size={24} className="text-slate-400" />
                            )}
                          </div>

                          <h4 className={`text-sm font-bold mb-1 ${isUnlocked
                              ? ''
                              : 'text-slate-400 dark:text-slate-500'
                            }`}>
                            {config.name}
                          </h4>
                          <p className={`text-[10px] leading-snug mb-2 ${isUnlocked
                              ? 'text-slate-500 dark:text-slate-400'
                              : 'text-slate-400 dark:text-slate-500/50'
                            }`}>
                            {config.description}
                          </p>

                          {isUnlocked && badge && (
                            <p className="text-[10px] font-medium flex items-center justify-center gap-1" style={{ color }}>
                              <Sparkles size={10} />
                              {formatDisplayDate(badge.unlockedAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
