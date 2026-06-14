import { useState, useEffect } from 'react';
import { X, Calendar, StickyNote, Check, Clock, Plus, Minus } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { CheckIn, Habit } from '@/types';
import { todayStr, isFuture, formatDisplayDate } from '@/utils/date';
import { getCheckInByDate, isDayCompleted } from '@/utils/stats';
import { useAppStore } from '@/store/useAppStore';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  checkIns: CheckIn[];
  onToggleCheckIn: (habitId: string, date: string, note?: string, isBackfilled?: boolean, value?: number) => void;
  onSetCompleted?: (habitId: string, date: string, completed: boolean, value?: number, isBackfilled?: boolean) => void;
  onUpdateNote?: (habitId: string, date: string, note: string) => void;
  initialDate?: string;
}

export const CheckInModal = ({
  isOpen,
  onClose,
  habit,
  checkIns,
  onToggleCheckIn,
  onSetCompleted,
  onUpdateNote,
  initialDate
}: CheckInModalProps) => {
  const storeSetCheckInCompleted = useAppStore((s) => s.setCheckInCompleted);
  const storeUpdateCheckInNote = useAppStore((s) => s.updateCheckInNote);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [note, setNote] = useState('');
  const [numericValue, setNumericValue] = useState<number>(0);

  const handleSetCompleted = onSetCompleted ?? storeSetCheckInCompleted;
  const handleUpdateNote = onUpdateNote ?? storeUpdateCheckInNote;

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    } else {
      setSelectedDate(todayStr());
    }
  }, [initialDate, isOpen]);

  useEffect(() => {
    if (habit && selectedDate) {
      const existing = getCheckInByDate(habit.id, selectedDate, checkIns);
      setNote(existing?.note || '');
      if (habit.goalType === 'numeric') {
        setNumericValue(existing?.value ?? 0);
      } else {
        setNumericValue(0);
      }
    }
  }, [habit, selectedDate, checkIns, isOpen]);

  if (!isOpen || !habit) return null;

  const today = todayStr();
  const pastDays = eachDayOfInterval({
    start: subMonths(new Date(today), 1),
    end: parseISO(today)
  }).reverse();

  const isSelectedToday = selectedDate === today;
  const isBackfilled = selectedDate !== today;
  const currentCheckIn = getCheckInByDate(habit.id, selectedDate, checkIns);
  const isCompleted = isDayCompleted(habit, selectedDate, checkIns);
  const isNumeric = habit.goalType === 'numeric';

  const handleToggleDayCell = (date: string) => {
    if (isFuture(date)) return;
    const willBeCompleted = !isDayCompleted(habit, date, checkIns);
    if (habit.goalType === 'numeric') {
      const existing = getCheckInByDate(habit.id, date, checkIns);
      const value = willBeCompleted ? (existing?.value ?? habit.goalValue) : (existing?.value ?? 0);
      handleSetCompleted(habit.id, date, willBeCompleted, value, date !== today);
    } else {
      handleSetCompleted(habit.id, date, willBeCompleted, undefined, date !== today);
    }
  };

  const handleToggleMainButton = () => {
    if (isFuture(selectedDate)) return;
    const willBeCompleted = !isCompleted;
    if (isNumeric) {
      const value = willBeCompleted ? Math.max(numericValue, habit.goalValue) : numericValue;
      handleSetCompleted(habit.id, selectedDate, willBeCompleted, value, isBackfilled);
    } else {
      handleSetCompleted(habit.id, selectedDate, willBeCompleted, undefined, isBackfilled);
    }
  };

  const handleSaveNote = () => {
    handleUpdateNote(habit.id, selectedDate, note);
  };

  const handleNoteAndCheckIn = () => {
    if (isNumeric) {
      handleSetCompleted(habit.id, selectedDate, true, Math.max(numericValue, habit.goalValue), isBackfilled);
    } else {
      handleSetCompleted(habit.id, selectedDate, true, undefined, isBackfilled);
    }
    handleUpdateNote(habit.id, selectedDate, note);
  };

  const handleNumericValueChange = (newValue: number) => {
    const clampedValue = Math.max(0, newValue);
    setNumericValue(clampedValue);
    if (isNumeric) {
      const willBeCompleted = clampedValue >= habit.goalValue;
      handleSetCompleted(habit.id, selectedDate, willBeCompleted, clampedValue, isBackfilled);
    }
  };

  const progressPercent = isNumeric
    ? Math.min(100, Math.round((numericValue / Math.max(1, habit.goalValue)) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg animate-bounce-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${habit.color}15` }}
            >
              <Calendar size={20} style={{ color: habit.color }} />
            </div>
            <div>
              <h2 className="font-bold">补签记录</h2>
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

        <div className="p-5 space-y-5 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-500 dark:text-slate-400">
              选择日期
            </label>
            <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {pastDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const ci = getCheckInByDate(habit.id, dateStr, checkIns);
                const dayCompleted = isDayCompleted(habit, dateStr, checkIns);
                const hasNote = ci?.note && ci.note.length > 0;
                const isSelected = selectedDate === dateStr;
                const isTodayDate = dateStr === today;
                const disabled = isFuture(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => !disabled && setSelectedDate(dateStr)}
                    onDoubleClick={() => handleToggleDayCell(dateStr)}
                    disabled={disabled}
                    className={`relative aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-all ${disabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:scale-105'
                      } ${isSelected
                        ? 'ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-500 z-10'
                        : ''
                      }`}
                    style={{
                      backgroundColor: dayCompleted
                        ? `${habit.color}${hasNote ? '' : '99'}`
                        : isTodayDate
                          ? `${habit.color}20`
                          : 'rgb(var(--muted))',
                      color: dayCompleted ? '#fff' : 'inherit'
                    }}
                  >
                    <span className="text-[11px] opacity-70">
                      {format(day, 'M月', { locale: zhCN }).replace('月', '/')}
                    </span>
                    <span className="text-sm font-bold -mt-0.5">{day.getDate()}</span>
                    {dayCompleted && hasNote && (
                      <StickyNote size={8} className="absolute top-0.5 right-0.5 text-white/90" />
                    )}
                    {isTodayDate && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              单击选中日期，双击切换打卡状态
            </p>
          </div>

          <div
            className="p-4 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: `${habit.color}10` }}
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                {isSelectedToday ? <Clock size={10} /> : <Calendar size={10} />}
                {formatDisplayDate(selectedDate)}
                {isSelectedToday ? '（今天）' : ''}
              </div>
              <div className="font-bold" style={{ color: habit.color }}>
                {isCompleted
                  ? `✓ 已完成${isNumeric ? ` (${numericValue}/${habit.goalValue}${habit.goalUnit})` : '打卡'}`
                  : isNumeric
                    ? `未完成 (${numericValue}/${habit.goalValue}${habit.goalUnit})`
                    : '未完成'}
              </div>
            </div>
            <button
              onClick={handleToggleMainButton}
              disabled={isFuture(selectedDate)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                  ? 'bg-white dark:bg-slate-700 border-2'
                  : 'text-white shadow-soft hover:scale-110'
                }`}
              style={!isCompleted
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : { borderColor: habit.color, color: habit.color }
              }
            >
              <Check size={24} strokeWidth={3} />
            </button>
          </div>

          {isNumeric && (
            <div
              className="p-4 rounded-xl space-y-3"
              style={{ backgroundColor: `${habit.color}08` }}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  数值进度
                </label>
                <span className="text-sm font-bold" style={{ color: habit.color }}>
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: habit.color
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  当前进度：<span className="font-bold" style={{ color: habit.color }}>{numericValue}</span> / {habit.goalValue} {habit.goalUnit}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNumericValueChange(numericValue - 1)}
                  disabled={isFuture(selectedDate)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={numericValue}
                  onChange={(e) => handleNumericValueChange(Number(e.target.value) || 0)}
                  disabled={isFuture(selectedDate)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all disabled:opacity-50"
                  style={{ color: habit.color }}
                  min={0}
                />
                <button
                  onClick={() => handleNumericValueChange(numericValue + 1)}
                  disabled={isFuture(selectedDate)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => {
                  const presetValue = Math.round((percent / 100) * habit.goalValue * 10) / 10;
                  return (
                    <button
                      key={percent}
                      onClick={() => handleNumericValueChange(presetValue)}
                      disabled={isFuture(selectedDate)}
                      className="py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      style={{
                        backgroundColor: percent === 100 ? `${habit.color}15` : 'rgba(var(--muted), 0.5)',
                        color: percent === 100 ? habit.color : 'inherit'
                      }}
                    >
                      {percent}%
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-2 text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <StickyNote size={12} />
              备注（可选）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录一下今天的感受、成果或心得体会..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm resize-none transition-all"
            />
            <div className="flex justify-end gap-2 mt-2">
              {!isCompleted && (
                <button
                  onClick={handleNoteAndCheckIn}
                  disabled={isFuture(selectedDate)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2 shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50"
                  style={{
                    borderColor: habit.color,
                    color: habit.color,
                    backgroundColor: `${habit.color}08`
                  }}
                >
                  备注+打卡
                </button>
              )}
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-soft hover:shadow-soft-lg transition-all"
                style={{ backgroundColor: habit.color }}
              >
                保存备注
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
