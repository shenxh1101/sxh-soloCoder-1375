import { parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, eachDayOfInterval, isSameDay, format } from 'date-fns';
import type { Habit, CheckIn, HabitStats, TrendDataPoint, CompareDataPoint } from '@/types';
import { todayStr } from './date';

export const getHabitCheckIns = (habitId: string, checkIns: CheckIn[]): CheckIn[] => {
  return checkIns.filter(c => c.habitId === habitId && c.completed);
};

export const hasCheckedIn = (habitId: string, date: string, checkIns: CheckIn[]): boolean => {
  const ci = checkIns.find(c => c.habitId === habitId && c.date === date);
  if (!ci) return false;
  const habitCheckIns = checkIns.filter(c => c.habitId === habitId);
  const habit: Habit | undefined = (globalThis as any).__HABIT_CACHE__?.[habitId];
  if (habit && habit.goalType === 'numeric') {
    return ci.completed || (ci.value ?? 0) >= habit.goalValue;
  }
  return ci.completed;
};

export const getCheckInByDate = (habitId: string, date: string, checkIns: CheckIn[]): CheckIn | undefined => {
  return checkIns.find(c => c.habitId === habitId && c.date === date);
};

export const isDayCompleted = (habit: Habit, date: string, checkIns: CheckIn[]): boolean => {
  const ci = getCheckInByDate(habit.id, date, checkIns);
  if (!ci) return false;
  if (habit.goalType === 'numeric') {
    return (ci.value ?? 0) >= habit.goalValue;
  }
  return ci.completed;
};

export const calculateStreak = (habit: Habit, checkIns: CheckIn[]): { current: number; longest: number } => {
  const allDates = Array.from(new Set(checkIns.filter(c => c.habitId === habit.id).map(c => c.date))).sort();
  const completedDates = allDates.filter(d => isDayCompleted(habit, d, checkIns));

  if (completedDates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
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

  let currentStreak = 0;
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
  }

  return { current: currentStreak, longest };
};

export const calculateTodayValue = (habit: Habit, checkIns: CheckIn[]): number => {
  const today = todayStr();
  const ci = getCheckInByDate(habit.id, today, checkIns);
  if (habit.goalType === 'numeric') {
    return ci?.value ?? 0;
  }
  return ci?.completed ? 1 : 0;
};

export const calculateTodayProgress = (habit: Habit, checkIns: CheckIn[]): number => {
  const todayValue = calculateTodayValue(habit, checkIns);
  const target = habit.goalType === 'numeric' ? habit.goalValue : 1;
  if (target === 0) return 0;
  return Math.min(100, Math.round((todayValue / target) * 100));
};

export const calculateThisMonthValue = (habit: Habit, checkIns: CheckIn[]): number => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = new Date();

  const monthCheckIns = checkIns.filter(c => {
    if (c.habitId !== habit.id) return false;
    const d = parseISO(c.date);
    return d >= monthStart && d <= monthEnd;
  });

  if (habit.goalType === 'numeric') {
    return monthCheckIns.reduce((sum, c) => sum + (c.value ?? 0), 0);
  }
  return monthCheckIns.filter(c => c.completed).length;
};

export const calculateMonthlyCompletionRate = (habit: Habit, checkIns: CheckIn[]): number => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();

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

  if (habit.goalType === 'numeric') {
    const monthTarget = totalPossible * habit.goalValue;
    const actualValue = calculateThisMonthValue(habit, checkIns);
    if (monthTarget === 0) return 0;
    return Math.min(100, Math.round((actualValue / monthTarget) * 100));
  }

  const completedCount = getHabitCheckIns(habit.id, checkIns).filter(c => {
    const d = parseISO(c.date);
    return d >= monthStart && d <= monthEnd;
  }).length;

  if (totalPossible === 0) return 0;
  return Math.min(100, Math.round((completedCount / totalPossible) * 100));
};

export const calculateMonthlyNumericRate = (habit: Habit, checkIns: CheckIn[]): number => {
  return calculateMonthlyCompletionRate(habit, checkIns);
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
  const streak = calculateStreak(habit, checkIns);
  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    monthlyCompletionRate: calculateMonthlyCompletionRate(habit, checkIns),
    totalCheckIns: getHabitCheckIns(habit.id, checkIns).length,
    thisMonthCount: calculateThisMonthCount(habit, checkIns),
    weeklyCount: calculateWeeklyCount(habit, checkIns),
    todayValue: calculateTodayValue(habit, checkIns),
    todayProgress: calculateTodayProgress(habit, checkIns),
    thisMonthValue: calculateThisMonthValue(habit, checkIns),
    monthlyNumericRate: calculateMonthlyNumericRate(habit, checkIns)
  };
};

export const getOverallStats = (habits: Habit[], checkIns: CheckIn[], badgesCount: number = 0): {
  totalHabits: number;
  todayCompleted: number;
  totalCheckInDays: number;
  totalBadges: number;
} => {
  const today = todayStr();
  const todayCompleted = habits.filter(h => isDayCompleted(h, today, checkIns)).length;

  const uniqueDays = new Set(
    checkIns.filter(c => c.completed).map(c => c.date)
  ).size;

  return {
    totalHabits: habits.length,
    todayCompleted,
    totalCheckInDays: uniqueDays,
    totalBadges: badgesCount
  };
};

export const getTrendData = (habits: Habit[], checkIns: CheckIn[], days: number = 14): TrendDataPoint[] => {
  const result: TrendDataPoint[] = [];
  (globalThis as any).__HABIT_CACHE__ = Object.fromEntries(habits.map(h => [h.id, h]));

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dateObj = subDays(new Date(), i);
    const label = format(dateObj, 'M/d', { locale: undefined });

    const completedCount = habits.filter(h => isDayCompleted(h, date, checkIns)).length;
    const completion = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

    result.push({ date, label, completion });
  }

  return result;
};

export const getCompareData = (habits: Habit[], checkIns: CheckIn[]): CompareDataPoint[] => {
  return habits.map(habit => ({
    name: habit.name,
    value: calculateMonthlyCompletionRate(habit, checkIns),
    color: habit.color
  }));
};

const getDay = (date: Date): number => {
  return date.getDay();
};

export const getMonthlyTargetTotal = (habit: Habit): number => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;

  if (habit.frequency === 'daily') {
    return habit.goalType === 'numeric' ? daysInMonth * habit.goalValue : daysInMonth;
  } else {
    const weeks = Math.ceil(daysInMonth / 7);
    return habit.goalType === 'numeric' ? weeks * habit.targetCount * habit.goalValue : weeks * habit.targetCount;
  }
};
