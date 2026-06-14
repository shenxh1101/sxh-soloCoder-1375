import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as LucideIcons from 'lucide-react';
import type { Habit, CheckIn } from '@/types';
import { useHabitStats, useHasCheckedIn } from '@/hooks/useHabitStats';
import { todayStr, isFuture } from '@/utils/date';
import { ProgressRing } from './ui/ProgressRing';
import { Heatmap } from './Heatmap';
import {
  Flame,
  Check,
  GripVertical,
  MoreHorizontal,
  Edit3,
  Trash2,
  CalendarCheck,
  History,
  Calendar,
  X
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  checkIns: CheckIn[];
  onToggleCheckIn: (date?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenCheckInModal: (initialDate?: string) => void;
  onGeneratePoster: () => void;
  index: number;
}

const priorityColors = [
  'bg-slate-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-red-500'
];

export const HabitCard = ({
  habit,
  checkIns,
  onToggleCheckIn,
  onEdit,
  onDelete,
  onOpenCheckInModal,
  onGeneratePoster,
  index
}: HabitCardProps) => {
  const stats = useHabitStats(habit, checkIns);
  const today = todayStr();
  const checkedToday = useHasCheckedIn(habit.id, today, checkIns);
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
    animationDelay: `${Math.min(index * 0.05, 0.3)}s`
  };

  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Star;

  const handleCheckIn = () => {
    if (!isAnimating && !checkedToday) {
      setIsAnimating(true);
    }
    onToggleCheckIn();
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleHeatmapClick = (date: string) => {
    if (isFuture(date)) return;
    onOpenCheckInModal(date);
  };

  const frequencyText = habit.frequency === 'daily'
    ? `每天 ${habit.targetCount} 次`
    : `每周 ${habit.targetCount} 次`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-5 relative group animate-fade-in-up ${isDragging ? 'shadow-card-hover scale-105' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 -ml-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-colors touch-none"
          >
            <GripVertical size={16} />
          </button>

          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0"
            style={{ backgroundColor: `${habit.color}15` }}
          >
            <IconComponent size={22} style={{ color: habit.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-sm truncate">{habit.name}</h3>
              <span
                className={`priority-dot flex-shrink-0 ${priorityColors[Math.max(0, Math.min(4, habit.priority - 1))]}`}
                title={`优先级 ${habit.priority}/5`}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-pill bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                <Calendar size={10} />
                {frequencyText}
              </span>
              {habit.group && (
                <span className="badge-pill" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
                  {habit.group}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft-lg min-w-[140px] animate-slide-down">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit3 size={14} />
                  编辑习惯
                </button>
                <button
                  onClick={() => { onOpenCheckInModal(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <History size={14} />
                  补签记录
                </button>
                <button
                  onClick={() => { onGeneratePoster(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <CalendarCheck size={14} />
                  生成海报
                </button>
                <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                  删除习惯
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: `${habit.color}10` }}>
          <Flame size={18} style={{ color: habit.color }} className={stats.currentStreak >= 7 ? 'animate-pulse' : ''} />
          <div className="leading-tight">
            <div className="font-bold" style={{ color: habit.color }}>
              {stats.currentStreak}
              <span className="text-[10px] font-normal ml-0.5">天</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">连续打卡</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/30">
          <CalendarCheck size={18} className="text-accent-500" />
          <div className="leading-tight">
            <div className="font-bold text-slate-700 dark:text-slate-200">
              {stats.thisMonthCount}
              <span className="text-[10px] font-normal ml-0.5 text-slate-500 dark:text-slate-400">次</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">本月完成</div>
          </div>
        </div>

        <div className="ml-auto">
          <ProgressRing
            progress={stats.monthlyCompletionRate}
            size={64}
            strokeWidth={6}
            color={habit.color}
            label="本月"
          />
        </div>
      </div>

      <div className="mb-4 px-1">
        <Heatmap
          habitId={habit.id}
          checkIns={checkIns}
          color={habit.color}
          weeks={10}
          onCellClick={handleHeatmapClick}
        />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          最长连续: <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.longestStreak}</span> 天
          <span className="mx-1.5">·</span>
          累计: <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.totalCheckIns}</span> 次
        </div>

        <button
          onClick={handleCheckIn}
          disabled={checkedToday}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${checkedToday
              ? 'bg-grad-secondary shadow-lg cursor-default'
              : `hover:scale-110 shadow-xl hover:shadow-2xl ${isAnimating ? 'animate-bounce-in' : 'animate-pulse-ring'}`
            }`}
          style={{
            background: checkedToday
              ? undefined
              : `linear-gradient(135deg, ${habit.color} 0%, ${habit.color}dd 100%)`
          }}
        >
          {checkedToday ? (
            <Check size={24} className="text-white animate-check" strokeWidth={3} />
          ) : (
            <X size={22} className="text-white font-light" />
          )}
        </button>
      </div>
    </div>
  );
};
