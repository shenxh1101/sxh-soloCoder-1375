import { useMemo } from 'react';
import type { Habit, CheckIn, HabitStats, TrendDataPoint, CompareDataPoint, Badge } from '@/types';
import { getHabitStats, hasCheckedIn, getCheckInByDate, getOverallStats, getTrendData, getCompareData } from '@/utils/stats';
import { generateHeatmapDates, getDayOfWeek } from '@/utils/date';
import { format } from 'date-fns';

export const useHabitStats = (habit: Habit, checkIns: CheckIn[]): HabitStats => {
  return useMemo(() => getHabitStats(habit, checkIns), [habit, checkIns]);
};

export const useHasCheckedIn = (habitId: string, date: string, checkIns: CheckIn[]): boolean => {
  return useMemo(() => hasCheckedIn(habitId, date, checkIns), [habitId, date, checkIns]);
};

export const useHeatmapData = (habitId: string, checkIns: CheckIn[], weeks: number = 12) => {
  return useMemo(() => {
    const dates = generateHeatmapDates(weeks);
    const weekCount = Math.ceil(dates.length / 7);
    const grid: (Date | null)[][] = Array.from({ length: 7 }, () => Array(weekCount).fill(null));

    dates.forEach((date) => {
      const weekIndex = Math.floor(dates.indexOf(date) / 7);
      const dayIndex = getDayOfWeek(date);
      if (grid[dayIndex]) {
        grid[dayIndex][weekIndex] = date;
      }
    });

    return {
      grid,
      dates,
      weekCount,
      getCellLevel: (date: Date | null): number => {
        if (!date) return 0;
        const dateStr = format(date, 'yyyy-MM-dd');
        const ci = getCheckInByDate(habitId, dateStr, checkIns);
        if (!ci || !ci.completed) return 0;
        if (ci.note && ci.note.length > 0) return 4;
        return 3;
      },
      getCellDate: (date: Date | null): string => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
      },
      getCellNote: (date: Date | null): string => {
        if (!date) return '';
        const dateStr = format(date, 'yyyy-MM-dd');
        const ci = getCheckInByDate(habitId, dateStr, checkIns);
        return ci?.note || '';
      }
    };
  }, [habitId, checkIns, weeks]);
};

export const useOverallStats = (habits: Habit[], checkIns: CheckIn[], badges: Badge[]) => {
  return useMemo(() => {
    const stats = getOverallStats(habits, checkIns);
    return { ...stats, totalBadges: badges.length };
  }, [habits, checkIns, badges]);
};

export const useTrendData = (habits: Habit[], checkIns: CheckIn[], days: number = 14): TrendDataPoint[] => {
  return useMemo(() => getTrendData(habits, checkIns, days), [habits, checkIns, days]);
};

export const useCompareData = (habits: Habit[], checkIns: CheckIn[]): CompareDataPoint[] => {
  return useMemo(() => getCompareData(habits, checkIns), [habits, checkIns]);
};

export const useSortedHabits = (habits: Habit[], cardOrder: string[], sortBy: 'order' | 'priority' | 'group' = 'order'): Habit[] => {
  return useMemo(() => {
    const sorted = [...habits];

    if (sortBy === 'order') {
      return sorted.sort((a, b) => {
        const idxA = cardOrder.indexOf(a.id);
        const idxB = cardOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    if (sortBy === 'priority') {
      return sorted.sort((a, b) => b.priority - a.priority);
    }

    if (sortBy === 'group') {
      return sorted.sort((a, b) => a.group.localeCompare(b.group, 'zh'));
    }

    return sorted;
  }, [habits, cardOrder, sortBy]);
};
