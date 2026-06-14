import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
  ArrowLeft, Flame, CalendarCheck, Trophy, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Filter, StickyNote, Check, Edit3,
  X, MoreHorizontal, Eye, EyeOff
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStats } from '@/hooks/useHabitStats';
import {
  format, addMonths, subMonths, eachDayOfInterval, startOfMonth,
  endOfMonth, isSameMonth, isSameDay, parseISO, isFuture as isFutureDate
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { CheckIn } from '@/types';
import { getCheckInByDate, isDayCompleted, getMonthlyTargetTotal } from '@/utils/stats';
import { todayStr, formatDisplayDate, isFuture } from '@/utils/date';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CheckInModal } from '@/components/CheckInModal';

type ViewMode = 'timeline' | 'calendar';

export default function HabitDetail() {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();

  const {
    habits, checkIns, badges,
    toggleCheckIn, setCheckInCompleted, updateCheckInNote
  } = useAppStore();

  const habit = habits.find(h => h.id === habitId);
  const stats = habit ? useHabitStats(habit, checkIns) : null;
  const habitBadges = badges.filter(b => b.habitId === habitId);
  const habitCheckIns = checkIns.filter(c => c.habitId === habitId);

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [monthOffset, setMonthOffset] = useState(0);
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [editingNote, setEditingNote] = useState<{ date: string; value: string } | null>(null);

  const currentMonth = useMemo(() => addMonths(new Date(), monthOffset), [monthOffset]);
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const sortedHistory = useMemo(() => {
    const history = [...habitCheckIns];
    if (onlyWithNotes) {
      return history.filter(c => c.note && c.note.trim()).sort((a, b) => b.date.localeCompare(a.date));
    }
    return history.sort((a, b) => b.date.localeCompare(a.date));
  }, [habitCheckIns, onlyWithNotes]);

  if (!habit || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <MoreHorizontal size={28} className="text-slate-400" />
          </div>
          <h2 className="font-bold text-lg">习惯不存在</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">该习惯可能已被删除</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            <ArrowLeft size={18} /> 返回首页
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Star;
  const monthTarget = getMonthlyTargetTotal(habit);
  const monthRate = stats.monthlyCompletionRate;

  const openDayEditor = (date: string) => {
    setInitialDate(date);
    setShowCheckInModal(true);
  };

  const toggleDayComplete = (dateStr: string) => {
    if (isFuture(dateStr)) return;
    const ci = getCheckInByDate(habit.id, dateStr, checkIns);
    const nowCompleted = ci ? !isDayCompleted(habit, dateStr, checkIns) : true;
    let newValue = undefined;
    if (habit.goalType === 'numeric' && nowCompleted) {
      newValue = habit.goalValue;
    }
    setCheckInCompleted(habit.id, dateStr, nowCompleted, newValue, dateStr !== todayStr());
  };

  const toggleNoteEdit = (ci: CheckIn) => {
    if (editingNote?.date === ci.date) {
      if (editingNote.value !== ci.note) {
        updateCheckInNote(habit.id, ci.date, editingNote.value);
      }
      setEditingNote(null);
    } else {
      setEditingNote({ date: ci.date, value: ci.note });
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-40 glass border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft"
              style={{ backgroundColor: `${habit.color}15` }}
            >
              <IconComponent size={20} style={{ color: habit.color }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold truncate">{habit.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                {habit.group} · 优先级 {habit.priority}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${habit.color}15` }}>
              <Flame size={20} style={{ color: habit.color }} className={stats.currentStreak >= 7 ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}<span className="text-xs font-normal text-slate-500 ml-1">天</span></div>
              <div className="text-xs text-slate-500 dark:text-slate-400">连续打卡</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.longestStreak}<span className="text-xs font-normal text-slate-500 ml-1">天</span></div>
              <div className="text-xs text-slate-500 dark:text-slate-400">最长连续</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CalendarCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {habit.goalType === 'numeric' ? `${stats.thisMonthValue}` : stats.thisMonthCount}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {habit.goalType === 'numeric' ? `${habit.goalUnit}/${monthTarget}${habit.goalUnit}` : `/${monthTarget}次`}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">本月进度</div>
            </div>
          </div>
          <div className="card p-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">本月完成率</div>
            <ProgressRing progress={monthRate} size={56} strokeWidth={5} color={habit.color} label="月" />
          </div>
        </div>

        {habitBadges.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-warm-500" />
              <h3 className="font-semibold text-sm">已获得徽章</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {habitBadges.map(b => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: `${habit.color}10` }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: habit.color }}>
                    {(() => {
                      const BadgeIcon = (LucideIcons as any)['Sparkles'];
                      return <BadgeIcon size={14} className="text-white" />;
                    })()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold" style={{ color: habit.color }}>{b.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatDisplayDate(b.unlockedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-sm font-medium transition-all ${viewMode === 'timeline' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              style={viewMode === 'timeline' ? { backgroundColor: habit.color } : {}}
            >
              时间线
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium transition-all ${viewMode === 'calendar' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              style={viewMode === 'calendar' ? { backgroundColor: habit.color } : {}}
            >
              月历
            </button>
          </div>
          <button
            onClick={() => setOnlyWithNotes(!onlyWithNotes)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              onlyWithNotes ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {onlyWithNotes ? <Eye size={14} /> : <EyeOff size={14} />}
            仅看有备注
          </button>
        </div>

        {viewMode === 'calendar' && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setMonthOffset(o => o - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2 font-bold">
                <CalendarIcon size={18} style={{ color: habit.color }} />
                {format(currentMonth, 'yyyy 年 M 月', { locale: zhCN })}
              </div>
              <button
                onClick={() => setMonthOffset(o => Math.min(0, o + 1))}
                disabled={monthOffset >= 0}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {['一', '二', '三', '四', '五', '六', '日'].map(w => (
                <div key={w} className="text-center text-[10px] text-slate-400 font-medium py-1">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {monthDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const ci = getCheckInByDate(habit.id, dateStr, checkIns);
                const completed = isDayCompleted(habit, dateStr, checkIns);
                const hasNote = !!ci?.note;
                const today = isSameDay(day, new Date());
                const future = isFutureDate(day) && !today;
                const inCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={dateStr}
                    disabled={future || !inCurrentMonth}
                    onClick={() => openDayEditor(dateStr)}
                    className={`relative aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-all ${
                      future ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
                    }`}
                    style={{
                      backgroundColor: completed
                        ? `${habit.color}${hasNote ? '' : 'cc'}`
                        : today
                          ? `${habit.color}20`
                          : 'rgb(var(--muted))',
                      color: completed ? '#fff' : 'inherit'
                    }}
                  >
                    <span className="text-sm font-bold">{day.getDate()}</span>
                    {completed && habit.goalType === 'numeric' && ci?.value != null && (
                      <span className="text-[9px] opacity-80 leading-none">{ci.value}{habit.goalUnit}</span>
                    )}
                    {hasNote && (
                      <StickyNote size={8} className="absolute top-0.5 right-0.5 text-white/90" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: habit.color }} />已完成
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: `${habit.color}30` }} />今日
                </div>
                <div className="flex items-center gap-1">
                  <StickyNote size={10} />有备注
                </div>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                本月已完成 <span className="font-bold" style={{ color: habit.color }}>{stats.thisMonthCount}</span> 天
              </div>
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-3">
            {sortedHistory.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${habit.color}15` }}>
                  <CalendarIcon size={28} style={{ color: habit.color }} />
                </div>
                <p className="font-medium">暂无打卡记录</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">从今天开始吧！</p>
              </div>
            ) : (
              sortedHistory.map(ci => {
                const completed = isDayCompleted(habit, ci.date, checkIns);
                const isEditingNote = editingNote?.date === ci.date;
                const future = isFuture(ci.date);

                return (
                  <div
                    key={ci.id}
                    className="card p-4 flex items-start gap-4"
                  >
                    <button
                      disabled={future}
                      onClick={() => toggleDayComplete(ci.date)}
                      className={`mt-1 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${
                        completed ? '' : future ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: completed
                          ? habit.color
                          : 'rgb(var(--muted))',
                        boxShadow: completed ? `0 4px 14px ${habit.color}50` : 'none'
                      }}
                    >
                      {completed ? (
                        <Check size={18} className="text-white" strokeWidth={3} />
                      ) : (
                        <X size={18} className="text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{formatDisplayDate(ci.date)}</p>
                        <span className={`badge-pill text-[10px] ${
                          completed
                            ? 'text-white'
                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                        }`} style={completed ? { backgroundColor: habit.color } : {}}>
                          {completed ? '已完成' : '未完成'}
                        </span>
                        {ci.isBackfilled && (
                          <span className="badge-pill text-[10px] bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                            补签
                          </span>
                        )}
                      </div>

                      {habit.goalType === 'numeric' && (
                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <span className="font-bold" style={{ color: habit.color }}>
                            {ci.value ?? 0} {habit.goalUnit}
                          </span>
                          <span className="text-slate-400">/ {habit.goalValue} {habit.goalUnit}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (((ci.value ?? 0) / habit.goalValue) * 100))}%`,
                                backgroundColor: habit.color
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {isEditingNote ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNote.value}
                            onChange={e => setEditingNote({ date: ci.date, value: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-xs"
                            placeholder="添加备注..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNote(null)}
                              className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => toggleNoteEdit(ci)}
                              className="px-3 py-1.5 rounded-lg text-xs text-white"
                              style={{ backgroundColor: habit.color }}
                            >
                              保存备注
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          {(ci.note || '').trim() ? (
                            <div className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {ci.note}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic p-2.5">无备注，点击编辑添加...</p>
                          )}
                          <button
                            onClick={() => toggleNoteEdit(ci)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => { setShowCheckInModal(false); setInitialDate(undefined); }}
        habit={habit}
        checkIns={checkIns}
        onToggleCheckIn={toggleCheckIn}
        onSetCompleted={setCheckInCompleted}
        onUpdateNote={updateCheckInNote}
        initialDate={initialDate}
      />
    </div>
  );
}
