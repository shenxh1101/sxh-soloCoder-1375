import { useState, useEffect } from 'react';
import { X, Calendar, StickyNote, Check, Clock } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { CheckIn, Habit } from '@/types';
import { todayStr, isFuture, formatDisplayDate } from '@/utils/date';
import { getCheckInByDate } from '@/utils/stats';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  checkIns: CheckIn[];
  onToggleCheckIn: (habitId: string, date: string, note: string, isBackfilled: boolean) => void;
  initialDate?: string;
}

export const CheckInModal = ({ isOpen, onClose, habit, checkIns, onToggleCheckIn, initialDate }: CheckInModalProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [note, setNote] = useState('');

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
    }
  }, [habit, selectedDate, checkIns, isOpen]);

  if (!isOpen || !habit) return null;

  const today = todayStr();
  const pastDays = eachDayOfInterval({
    start: subMonths(new Date(today), 1),
    end: parseISO(today)
  }).reverse();

  const handleToggle = (date: string) => {
    const isBackfilled = date !== today;
    const existing = getCheckInByDate(habit.id, date, checkIns);
    const currentNote = date === selectedDate ? note : (existing?.note || '');
    onToggleCheckIn(habit.id, date, currentNote, isBackfilled);
  };

  const handleSaveNote = () => {
    const existing = getCheckInByDate(habit.id, selectedDate, checkIns);
    if (existing && existing.completed) {
      onToggleCheckIn(habit.id, selectedDate, note, selectedDate !== today);
    } else {
      onToggleCheckIn(habit.id, selectedDate, note, selectedDate !== today);
    }
  };

  const isSelectedToday = selectedDate === today;

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
                const isCompleted = ci?.completed;
                const hasNote = ci?.note && ci.note.length > 0;
                const isSelected = selectedDate === dateStr;
                const isTodayDate = dateStr === today;
                const disabled = isFuture(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => !disabled && setSelectedDate(dateStr)}
                    disabled={disabled}
                    className={`relative aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-all ${disabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:scale-105'
                      } ${isSelected
                        ? 'ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-500 z-10'
                        : ''
                      }`}
                    style={{
                      backgroundColor: isCompleted
                        ? `${habit.color}${hasNote ? '' : '99'}`
                        : isTodayDate
                          ? `${habit.color}20`
                          : 'rgb(var(--muted))',
                      color: isCompleted ? '#fff' : 'inherit'
                    }}
                  >
                    <span className="text-[11px] opacity-70">
                      {format(day, 'M月', { locale: zhCN }).replace('月', '/')}
                    </span>
                    <span className="text-sm font-bold -mt-0.5">{day.getDate()}</span>
                    {isCompleted && hasNote && (
                      <StickyNote size={8} className="absolute top-0.5 right-0.5 text-white/90" />
                    )}
                    {isTodayDate && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-500" />
                    )}
                  </button>
                );
              })}
            </div>
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
                {getCheckInByDate(habit.id, selectedDate, checkIns)?.completed
                  ? '✓ 已完成打卡'
                  : '未完成'}
              </div>
            </div>
            <button
              onClick={() => handleToggle(selectedDate)}
              disabled={isFuture(selectedDate)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getCheckInByDate(habit.id, selectedDate, checkIns)?.completed
                  ? 'bg-white dark:bg-slate-700 border-2'
                  : 'text-white shadow-soft hover:scale-110'
                }`}
              style={!getCheckInByDate(habit.id, selectedDate, checkIns)?.completed
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : { borderColor: habit.color, color: habit.color }
              }
            >
              <Check size={24} strokeWidth={3} />
            </button>
          </div>

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
            <div className="flex justify-end mt-2">
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
