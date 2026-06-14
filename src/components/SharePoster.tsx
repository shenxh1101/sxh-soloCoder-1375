import { useRef, useState, useEffect, useMemo } from 'react';
import { X, Download, Share2, Sparkles, Trophy, Flame, CalendarCheck, Crown, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Habit, CheckIn, Badge, HabitStats, BadgeType } from '@/types';
import { BADGE_CONFIG } from '@/types';
import { useHabitStats } from '@/hooks/useHabitStats';
import { todayStr, formatDisplayDate } from '@/utils/date';
import { getMonthlyTargetTotal } from '@/utils/stats';

interface SharePosterProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  checkIns: CheckIn[];
  habitBadges?: Badge[];
}

const DEFAULT_STATS: HabitStats = {
  currentStreak: 0,
  longestStreak: 0,
  monthlyCompletionRate: 0,
  totalCheckIns: 0,
  thisMonthCount: 0,
  weeklyCount: 0,
  todayValue: 0,
  todayProgress: 0,
  thisMonthValue: 0,
  monthlyNumericRate: 0
};

const iconMap: Record<string, any> = {
  Sparkles,
  Flame,
  Trophy,
  Crown
};

export const SharePoster = ({ isOpen, onClose, habit, checkIns, habitBadges = [] }: SharePosterProps) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsMounted(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    if (!habit) return DEFAULT_STATS;
    try {
      return useHabitStats(habit, checkIns);
    } catch (error) {
      console.error('计算统计数据失败:', error);
      return DEFAULT_STATS;
    }
  }, [habit, checkIns]);

  const filteredBadges = useMemo(() => {
    if (!habit) return [];
    return habitBadges.filter(b => b.habitId === habit.id);
  }, [habit, habitBadges]);

  const monthlyTargetTotal = useMemo(() => {
    if (!habit) return 0;
    return getMonthlyTargetTotal(habit);
  }, [habit]);

  const totalDays = useMemo(() => {
    if (!habit) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [habit]);

  const isMonthlyAchieved = stats.monthlyCompletionRate >= 100;

  useEffect(() => {
    setPreviewUrl(null);
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const today = todayStr();
  const IconComponent = habit ? (LucideIcons as any)[habit.icon] || LucideIcons.Star : LucideIcons.Star;
  const habitColor = habit?.color || '#4ECDC4';

  const generatePoster = async () => {
    if (!posterRef?.current) return;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!posterRef?.current) {
        setIsGenerating(false);
        return;
      }
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);
    } catch (error) {
      console.error('生成海报失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPoster = () => {
    if (!previewUrl || !habit) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `habit-poster-${habit.id}-${today}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg animate-bounce-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${habitColor}, ${habitColor}aa)` }}
            >
              <Share2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold">分享海报</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{habit?.name || '加载中...'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[calc(90vh-160px)] overflow-y-auto">
          <div className="flex justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="海报预览"
                className="rounded-xl shadow-soft-lg max-w-full"
              />
            ) : !habit || !isMounted ? (
              <div className="w-[320px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center" style={{ height: '480px' }}>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">海报加载中...</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {isMonthlyAchieved && (
                  <>
                    <div className="absolute -inset-1 rounded-3xl opacity-60 animate-pulse" style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%)',
                      filter: 'blur(8px)'
                    }} />
                    <div className="absolute -inset-0.5 rounded-3xl" style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24, #f59e0b)',
                      padding: '2px',
                      borderRadius: '1.5rem'
                    }}>
                      <div className="w-full h-full bg-white rounded-3xl" />
                    </div>
                  </>
                )}
                <div
                  ref={posterRef}
                  className="w-[320px] rounded-2xl overflow-hidden relative"
                  style={{
                    background: `linear-gradient(145deg, ${habitColor}15, ${habitColor}40, ${habitColor}15)`,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 30%, ${habitColor} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${habitColor} 0%, transparent 50%)`
                    }}
                  />

                  {isMonthlyAchieved && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        }} />
                        <div className="relative flex items-center gap-1 px-3 py-1 rounded-full shadow-lg" style={{
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)'
                        }}>
                          <Trophy size={12} className="text-white" />
                          <span className="text-[10px] font-bold text-white">月度达成</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative p-6">
                    <div className="text-center mb-5">
                      <div className="inline-block px-4 py-1 rounded-full text-xs font-bold text-white mb-2 shadow-soft"
                        style={{ backgroundColor: habitColor }}
                      >
                        <Sparkles size={10} className="inline mr-1 -mt-0.5" />
                        习惯成就
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                        {habit.name}
                        {isMonthlyAchieved && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          }}>
                            <Crown size={12} className="text-white" />
                          </span>
                        )}
                      </h2>
                    </div>

                    <div
                      className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-soft"
                      style={{
                        background: `linear-gradient(135deg, ${habitColor}, ${habitColor}cc)`,
                        boxShadow: `0 8px 24px ${habitColor}60`
                      }}
                    >
                      <IconComponent size={40} className="text-white" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-3 text-center">
                        <Flame size={18} className="mx-auto mb-1" style={{ color: habitColor }} />
                        <div className="text-2xl font-bold" style={{ color: habitColor }}>
                          {stats.currentStreak}
                        </div>
                        <div className="text-[10px] text-slate-500">连续天数</div>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-3 text-center">
                        <Trophy size={18} className="mx-auto mb-1 text-amber-500" />
                        <div className="text-2xl font-bold text-amber-600">
                          {stats.longestStreak}
                        </div>
                        <div className="text-[10px] text-slate-500">最长连续</div>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-3 text-center">
                        <CalendarCheck size={18} className="mx-auto mb-1 text-emerald-500" />
                        <div className="text-2xl font-bold text-emerald-600">
                          {stats.totalCheckIns}
                        </div>
                        <div className="text-[10px] text-slate-500">累计打卡</div>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-4 text-center mb-4">
                      <div className="text-xs text-slate-500 mb-1">本月完成率</div>
                      <div className="text-4xl font-bold bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(135deg, ${habitColor}, ${habitColor}aa)` }}
                      >
                        {stats.monthlyCompletionRate}%
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stats.monthlyCompletionRate}%`,
                            background: `linear-gradient(90deg, ${habitColor}, ${habitColor}cc)`
                          }}
                        />
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {habit.goalType === 'numeric' ? (
                          <span>
                            本月目标：{monthlyTargetTotal} {habit.goalUnit} · 已完成 {stats.thisMonthValue} {habit.goalUnit}
                          </span>
                        ) : (
                          <span>
                            本月打卡 {stats.thisMonthCount}/{totalDays} 天
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-4 mb-4">
                      <div className="text-xs text-slate-500 mb-3 text-center font-medium">
                        🏆 已获得徽章
                      </div>
                      {filteredBadges.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-3">
                          {filteredBadges.map((badge) => {
                            const config = BADGE_CONFIG[badge.type as BadgeType];
                            const Icon = iconMap[config?.icon] || Sparkles;
                            return (
                              <div key={badge.id} className="flex flex-col items-center gap-1">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft"
                                  style={{
                                    background: `linear-gradient(135deg, ${habitColor}20, ${habitColor}40)`
                                  }}
                                >
                                  <Icon size={20} style={{ color: habitColor }} />
                                </div>
                                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                                  {config?.name || badge.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-2">
                            <Lock size={18} className="text-slate-400" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            继续努力解锁徽章吧✨
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="font-bold" style={{ color: habitColor }}>习惯追踪器</span>
                        <span>·</span>
                        <span>{formatDisplayDate(today)}</span>
                      </div>
                      <p className="text-[10px] opacity-70">
                        坚持每一天，成就更好的自己 ✨
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!previewUrl ? (
              <button
                onClick={generatePoster}
                disabled={isGenerating || !habit || !isMounted}
                className="flex-1 py-3 rounded-xl text-white font-medium shadow-soft transition-all hover:shadow-soft-lg flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: habitColor }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    生成海报
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  重新生成
                </button>
                <button
                  onClick={downloadPoster}
                  className="flex-1 py-3 rounded-xl text-white font-medium shadow-soft transition-all hover:shadow-soft-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: habitColor }}
                >
                  <Download size={18} />
                  保存图片
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
