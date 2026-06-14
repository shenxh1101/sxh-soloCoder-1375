import { parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, eachDayOfInterval, isSameDay, format } from 'date-fns';
import type { Habit, CheckIn, HabitStats, TrendDataPoint, CompareDataPoint } from '@/types';
import { todayStr } from './date';

export const getHabitCheckIns = (habitId: string, checkIns: CheckIn[]): CheckIn[] => {
  return checkIns.filter(c => c.habitId === habitId && c.completed);
};

export const hasCheckedIn = (habitId: string, date: string, checkIns: CheckIn[]): boolean => {
  return checkIns.some(c => c.habitId === habitId && c.date === date && c.completed);
};

export const getCheckInByDate = (habitId: string, date: string, checkIns: CheckIn[]): CheckIn | undefined => {
  return checkIns.find(c => c.habitId === habitId && c.date === date);
};

export const calculateStreak = (habitId: string, checkIns: CheckIn[]): { current: number; longest: number } => {
  const completedDates = getHabitCheckIns(habitId, checkIns)
    .map(c => c.date)
    .sort();

  if (completedDates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const diff = Math.round(
      (parseISO(completedDates[i]).getTime() - parseISO(completedDates[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      tempStreak++;
    } else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak);

  const today = todayStr();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (completedDates.includes(today)) {
    currentStreak = 1;
    for (let i = completedDates.length - 2; i >= 0; i--) {
      const expected = format(subDays(new Date(), completedDates.length - 1 - i), 'yyyy-MM-dd');
      if (completedDates[i] === expected) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (completedDates.includes(yesterday)) {
    currentStreak = 1;
    for (let i = completedDates.length - 2; i >= 0; i--) {
      const expected = format(subDays(new Date(), completedDates.length - i), 'yyyy-MM-dd');
      if (completedDates[i] === expected) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest };
};

export const calculateMonthlyCompletionRate = (habit: Habit, checkIns: CheckIn[]): number => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();

  const completedCount = getHabitCheckIns(habit.id, checkIns).filter(c => {
    const d = parseISO(c.date);
    return d >= monthStart && d <= monthEnd;
  }).length;

  let totalPossible = 0;
  if (habit.frequency === 'daily') {
    totalPossible = daysInMonth.filter(d => d <= today).length;
  } else {
    const weeksInMonth = Math.ceil(daysInMonth.length / 7);
    const currentWeek = Math.ceil(
      (today.getDate() - startOfMonth(today).getDate() + 1 + (getDay(startOfMonth(today)) + 6) % 7) / 7
    );
    totalPossible = Math.min(currentWeek, weeksInMonth) * habit.targetCount;
  }

  if (totalPossible === 0) return 0;
  return Math.min(100, Math.round((completedCount / totalPossible) * 100));
};

export const calculateWeeklyCount = (habit: Habit, checkIns: CheckIn[]): number => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  return getHabitCheckIns(habit.id, checkIns).filter(c => {
    const d = parseISO(c.date);
    return d >= weekStart && d <= weekEnd;
  }).length;
};

export const calculateThisMonthCount = (habit: Habit, checkIns: CheckIn[]): number => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  return getHabitCheckIns(habit.id, checkIns).filter(c => {
    const d = parseISO(c.date);
    return d >= monthStart && d <= monthEnd;
  }).length;
};

export const getHabitStats = (habit: Habit, checkIns: CheckIn[]): HabitStats => {
  const streak = calculateStreak(habit.id, checkIns);
  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    monthlyCompletionRate: calculateMonthlyCompletionRate(habit, checkIns),
    totalCheckIns: getHabitCheckIns(habit.id, checkIns).length,
    thisMonthCount: calculateThisMonthCount(habit, checkIns),
    weeklyCount: calculateWeeklyCount(habit, checkIns)
  };
};

export const getOverallStats = (habits: Habit[], checkIns: CheckIn[]): {
  totalHabits: number;
  todayCompleted: number;
  totalCheckInDays: number;
  totalBadges: number;
} => {
  const today = todayStr();
  const todayCompleted = habits.filter(h => hasCheckedIn(h.id, today, checkIns)).length;

  const uniqueDays = new Set(
    checkIns.filter(c => c.completed).map(c => c.date)
  ).size;

  return {
    totalHabits: habits.length,
    todayCompleted,
    totalCheckInDays: uniqueDays,
    totalBadges: 0
  };
};

export const getTrendData = (habits: Habit[], checkIns: CheckIn[], days: number = 14): TrendDataPoint[] => {
  const result: TrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dateObj = subDays(new Date(), i);
    const label = format(dateObj, 'M/d', { locale: undefined });

    const completedCount = habits.filter(h => hasCheckedIn(h.id, date, checkIns)).length;
    const completion = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

    result.push({ date, label, completion });
  }

  return result;
};

export const getCompareData = (habits: Habit[], checkIns: CheckIn[]): CompareDataPoint[] => {
  const today = todayStr();
  const monthStart = startOfMonth(new Date());
  const monthEnd = new Date(today);

  return habits.map(habit => {
    const monthCheckIns = getHabitCheckIns(habit.id, checkIns).filter(c => {
      const d = parseISO(c.date);
      return d >= monthStart && d <= monthEnd;
    }).length;

    const daysInRange = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
    const target = habit.frequency === 'daily' ? daysInRange : Math.ceil(daysInRange / 7) * habit.targetCount;
    const value = target > 0 ? Math.round((monthCheckIns / target) * 100) : 0;

    return {
      name: habit.name,
      value: Math.min(100, value),
      color: habit.color
    };
  });
};

const getDay = (date: Date): number => {
  return date.getDay();
};
