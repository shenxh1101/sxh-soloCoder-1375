import type { Habit, CheckIn, Badge, BadgeType } from '@/types';
import { BADGE_CONFIG } from '@/types';
import { calculateStreak, calculateMonthlyCompletionRate } from './stats';
import { todayStr } from './date';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const checkBadgesToUnlock = (
  habit: Habit,
  checkIns: CheckIn[],
  existingBadges: Badge[]
): Badge[] => {
  const newBadges: Badge[] = [];
  const habitBadges = existingBadges.filter(b => b.habitId === habit.id);
  const badgeTypes = habitBadges.map(b => b.type);

  const streak = calculateStreak(habit, checkIns);
  const monthlyRate = calculateMonthlyCompletionRate(habit, checkIns);
  const habitCheckIns = checkIns.filter(c => c.habitId === habit.id && c.completed);

  if (!badgeTypes.includes('first_checkin') && habitCheckIns.length >= 1) {
    newBadges.push(createBadge(habit.id, 'first_checkin'));
  }

  if (!badgeTypes.includes('streak_7') && streak.current >= 7) {
    newBadges.push(createBadge(habit.id, 'streak_7'));
  }

  if (!badgeTypes.includes('streak_30') && streak.current >= 30) {
    newBadges.push(createBadge(habit.id, 'streak_30'));
  }

  if (!badgeTypes.includes('monthly_perfect') && monthlyRate >= 100) {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (now.getDate() >= lastDayOfMonth - 1) {
      newBadges.push(createBadge(habit.id, 'monthly_perfect'));
    }
  }

  return newBadges;
};

const createBadge = (habitId: string, type: BadgeType): Badge => {
  const config = BADGE_CONFIG[type];
  return {
    id: generateId(),
    habitId,
    type,
    name: config.name,
    description: config.description,
    unlockedAt: todayStr()
  };
};

export const shouldShowPoster = (habit: Habit, checkIns: CheckIn[]): boolean => {
  const monthlyRate = calculateMonthlyCompletionRate(habit, checkIns);
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return monthlyRate >= 80 && now.getDate() >= lastDayOfMonth - 2;
};
