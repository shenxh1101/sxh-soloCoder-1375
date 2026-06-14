import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, differenceInDays, isSameDay, getDay, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date | string, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDisplayDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'M月d日 EEEE', { locale: zhCN });
};

export const todayStr = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const isToday = (dateStr: string): boolean => {
  return isSameDay(parseISO(dateStr), new Date());
};

export const isFuture = (dateStr: string): boolean => {
  return differenceInDays(parseISO(dateStr), new Date()) > 0;
};

export const getWeekStart = (date: Date = new Date()): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const getWeekEnd = (date: Date = new Date()): Date => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

export const getMonthStart = (date: Date = new Date()): Date => {
  return startOfMonth(date);
};

export const getMonthEnd = (date: Date = new Date()): Date => {
  return endOfMonth(date);
};

export const getDaysInMonth = (date: Date = new Date()): Date[] => {
  return eachDayOfInterval({
    start: getMonthStart(date),
    end: getMonthEnd(date)
  });
};

export const generateHeatmapDates = (weeks: number = 12): Date[] => {
  const end = new Date();
  const start = subDays(startOfWeek(end, { weekStartsOn: 1 }), (weeks - 1) * 7);
  return eachDayOfInterval({ start, end });
};

export const getWeekdayLabels = (): string[] => {
  return ['一', '二', '三', '四', '五', '六', '日'];
};

export const getMonthLabels = (dates: Date[]): { label: string; index: number }[] => {
  const labels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  dates.forEach((date, index) => {
    const month = date.getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: format(date, 'M月', { locale: zhCN }),
        index: Math.floor(index / 7)
      });
      lastMonth = month;
    }
  });
  return labels;
};

export const getDayOfWeek = (date: Date): number => {
  return (getDay(date) + 6) % 7;
};

export const daysBetween = (date1: string, date2: string): number => {
  return Math.abs(differenceInDays(parseISO(date1), parseISO(date2)));
};

export const addDaysStr = (dateStr: string, days: number): string => {
  return format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd');
};

export const getRecentDays = (days: number): string[] => {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    result.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return result;
};
