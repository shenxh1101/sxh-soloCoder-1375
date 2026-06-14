import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Flame, Trophy, Crown, X } from 'lucide-react';
import type { Badge, Habit } from '@/types';
import { BADGE_CONFIG } from '@/types';
import { formatDisplayDate } from '@/utils/date';

const iconMap: Record<string, any> = {
  Sparkles,
  Flame,
  Trophy,
  Crown
};

interface BadgeNotificationProps {
  badges: Badge[];
  habits: Habit[];
  onClose: () => void;
}

export const BadgeNotification = ({ badges, habits, onClose }: BadgeNotificationProps) => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;

    if (visibleIndex < badges.length - 1) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setVisibleIndex((prev) => prev + 1);
          setIsLeaving(false);
        }, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visibleIndex, badges.length]);

  if (badges.length === 0) return null;

  const currentBadge = badges[visibleIndex];
  const config = BADGE_CONFIG[currentBadge.type];
  const Icon = iconMap[config.icon] || Sparkles;
  const habit = habits.find(h => h.id === currentBadge.habitId);
  const color = habit?.color || '#4ECDC4';

  const handleClose = () => {
    if (visibleIndex < badges.length - 1) {
      setIsLeaving(true);
      setTimeout(() => {
        setVisibleIndex((prev) => prev + 1);
        setIsLeaving(false);
      }, 200);
    } else {
      onClose();
      setVisibleIndex(0);
    }
  };

  return (
    <div className="fixed inset-x-0 top-20 z-[60] flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${isLeaving ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-bounce-in'}`}
      >
        <div
          className="relative h-2"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-white/30 animate-[shimmer_2s_linear_infinite]"
            style={{
              width: '50%',
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${color}30, ${color}50)`,
                boxShadow: `0 4px 20px ${color}40`
              }}
            >
              <div className="absolute -inset-1 rounded-2xl animate-pulse opacity-50"
                style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` }}
              />
              <Icon size={32} className="relative z-10" style={{ color }} />
              <Sparkles
                size={14}
                className="absolute -top-1 -right-1"
                style={{ color }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color }}>
                    🎉 新徽章解锁！
                  </div>
                  <h3 className="text-lg font-bold mb-0.5">{config.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {habit?.name || '未知习惯'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {config.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatDisplayDate(currentBadge.unlockedAt)}
                </span>
                <span className="text-[10px] font-medium" style={{ color }}>
                  {visibleIndex + 1} / {badges.length}
                </span>
              </div>
            </div>
          </div>

          {visibleIndex < badges.length - 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {badges.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === visibleIndex ? 'w-4' : ''}`}
                  style={{
                    backgroundColor: i <= visibleIndex ? color : 'rgb(var(--muted))'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
