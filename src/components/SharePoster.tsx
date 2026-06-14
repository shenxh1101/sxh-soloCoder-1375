import { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Sparkles, Trophy, Flame, CalendarCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Habit, CheckIn } from '@/types';
import { useHabitStats } from '@/hooks/useHabitStats';
import { todayStr, formatDisplayDate } from '@/utils/date';

interface SharePosterProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  checkIns: CheckIn[];
}

export const SharePoster = ({ isOpen, onClose, habit, checkIns }: SharePosterProps) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stats = habit ? useHabitStats(habit, checkIns) : null;

  useEffect(() => {
    setPreviewUrl(null);
  }, [habit, isOpen]);

  if (!isOpen || !habit || !stats) return null;

  const today = todayStr();
  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Star;

  const generatePoster = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
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
    if (!previewUrl) return;
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
              style={{ background: `linear-gradient(135deg, ${habit.color}, ${habit.color}aa)` }}
            >
              <Share2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold">分享海报</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{habit.name}</p>
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
            ) : (
              <div
                ref={posterRef}
                className="w-[320px] rounded-2xl overflow-hidden relative"
                style={{
                  background: `linear-gradient(145deg, ${habit.color}15, ${habit.color}40, ${habit.color}15)`
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, ${habit.color} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${habit.color} 0%, transparent 50%)`
                  }}
                />

                <div className="relative p-6">
                  <div className="text-center mb-5">
                    <div className="inline-block px-4 py-1 rounded-full text-xs font-bold text-white mb-2 shadow-soft"
                      style={{ backgroundColor: habit.color }}
                    >
                      <Sparkles size={10} className="inline mr-1 -mt-0.5" />
                      习惯成就
                    </div>
                    <h2 className="text-xl font-bold text-slate-800" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                      {habit.name}
                    </h2>
                  </div>

                  <div
                    className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-soft"
                    style={{
                      background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
                      boxShadow: `0 8px 24px ${habit.color}60`
                    }}
                  >
                    <IconComponent size={40} className="text-white" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl p-3 text-center">
                      <Flame size={18} className="mx-auto mb-1" style={{ color: habit.color }} />
                      <div className="text-2xl font-bold" style={{ color: habit.color }}>
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
                      style={{ backgroundImage: `linear-gradient(135deg, ${habit.color}, ${habit.color}aa)` }}
                    >
                      {stats.monthlyCompletionRate}%
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${stats.monthlyCompletionRate}%`,
                          background: `linear-gradient(90deg, ${habit.color}, ${habit.color}cc)`
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="font-bold" style={{ color: habit.color }}>习惯追踪器</span>
                      <span>·</span>
                      <span>{formatDisplayDate(today)}</span>
                    </div>
                    <p className="text-[10px] opacity-70">
                      坚持每一天，成就更好的自己 ✨
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!previewUrl ? (
              <button
                onClick={generatePoster}
                disabled={isGenerating}
                className="flex-1 py-3 rounded-xl text-white font-medium shadow-soft transition-all hover:shadow-soft-lg flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: habit.color }}
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
                  style={{ backgroundColor: habit.color }}
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
