import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, CheckIn, Badge, AppSettings } from '@/types';
import { generateId, checkBadgesToUnlock } from '@/utils/badges';
import { todayStr } from '@/utils/date';
import { hasCheckedIn, getCheckInByDate } from '@/utils/stats';
import { exportToCSV } from '@/utils/csv';
import { subDays, format } from 'date-fns';

interface AppStore {
  habits: Habit[];
  checkIns: CheckIn[];
  badges: Badge[];
  settings: AppSettings;
  newlyUnlockedBadges: Badge[];

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;

  toggleCheckIn: (habitId: string, date: string, note?: string, isBackfilled?: boolean) => void;
  updateCheckInNote: (checkInId: string, note: string) => void;

  reorderCards: (newOrder: string[]) => void;
  toggleDarkMode: () => void;

  exportData: () => void;
  clearNewBadges: () => void;
}

const generateSampleData = (): { habits: Habit[]; checkIns: CheckIn[]; badges: Badge[] } => {
  const now = new Date();
  const habits: Habit[] = [
    {
      id: 'habit-1',
      name: '每天阅读 30 分钟',
      icon: 'BookOpen',
      color: '#FF6B6B',
      frequency: 'daily',
      targetCount: 1,
      group: '自我提升',
      priority: 5,
      createdAt: format(subDays(now, 45), 'yyyy-MM-dd')
    },
    {
      id: 'habit-2',
      name: '每周运动 3 次',
      icon: 'Dumbbell',
      color: '#4ECDC4',
      frequency: 'weekly',
      targetCount: 3,
      group: '健康生活',
      priority: 4,
      createdAt: format(subDays(now, 60), 'yyyy-MM-dd')
    },
    {
      id: 'habit-3',
      name: '每天喝 8 杯水',
      icon: 'Droplets',
      color: '#45B7D1',
      frequency: 'daily',
      targetCount: 1,
      group: '健康生活',
      priority: 3,
      createdAt: format(subDays(now, 30), 'yyyy-MM-dd')
    },
    {
      id: 'habit-4',
      name: '每天早起 6:30',
      icon: 'Sun',
      color: '#FF8E53',
      frequency: 'daily',
      targetCount: 1,
      group: '作息规律',
      priority: 4,
      createdAt: format(subDays(now, 20), 'yyyy-MM-dd')
    },
    {
      id: 'habit-5',
      name: '每周学习编程 5 小时',
      icon: 'Code',
      color: '#A66CFF',
      frequency: 'weekly',
      targetCount: 5,
      group: '自我提升',
      priority: 5,
      createdAt: format(subDays(now, 90), 'yyyy-MM-dd')
    }
  ];

  const checkIns: CheckIn[] = [];

  const generateStreak = (habitId: string, startDaysAgo: number, endDaysAgo: number, skipDays: number[] = []) => {
    for (let i = startDaysAgo; i >= endDaysAgo; i--) {
      if (skipDays.includes(i)) continue;
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      checkIns.push({
        id: `ci-${habitId}-${i}`,
        habitId,
        date,
        completed: true,
        note: '',
        isBackfilled: i > 0
      });
    }
  };

  generateStreak('habit-1', 30, 0, [5, 12, 18, 25]);
  generateStreak('habit-2', 40, 0, [2, 5, 9, 14, 19, 24, 29, 34]);
  generateStreak('habit-3', 25, 0, [3, 7, 11, 16, 22]);
  generateStreak('habit-4', 12, 0, [4, 9]);
  generateStreak('habit-5', 60, 0, [2, 8, 15, 22, 30, 38, 45, 52]);

  const badges: Badge[] = [
    {
      id: 'badge-1',
      habitId: 'habit-1',
      type: 'first_checkin',
      name: '初出茅庐',
      description: '完成第一次打卡，开启习惯之旅',
      unlockedAt: format(subDays(now, 45), 'yyyy-MM-dd')
    },
    {
      id: 'badge-2',
      habitId: 'habit-2',
      type: 'first_checkin',
      name: '初出茅庐',
      description: '完成第一次打卡，开启习惯之旅',
      unlockedAt: format(subDays(now, 60), 'yyyy-MM-dd')
    },
    {
      id: 'badge-3',
      habitId: 'habit-1',
      type: 'streak_7',
      name: '七日恒心',
      description: '连续打卡 7 天，养成习惯的开始',
      unlockedAt: format(subDays(now, 23), 'yyyy-MM-dd')
    },
    {
      id: 'badge-4',
      habitId: 'habit-5',
      type: 'streak_7',
      name: '七日恒心',
      description: '连续打卡 7 天，养成习惯的开始',
      unlockedAt: format(subDays(now, 52), 'yyyy-MM-dd')
    },
    {
      id: 'badge-5',
      habitId: 'habit-5',
      type: 'streak_30',
      name: '月度达人',
      description: '连续打卡 30 天，习惯已融入生活',
      unlockedAt: format(subDays(now, 29), 'yyyy-MM-dd')
    }
  ];

  return { habits, checkIns, badges };
};

const sampleData = generateSampleData();

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      habits: sampleData.habits,
      checkIns: sampleData.checkIns,
      badges: sampleData.badges,
      settings: {
        darkMode: false,
        cardOrder: sampleData.habits.map(h => h.id)
      },
      newlyUnlockedBadges: [],

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: generateId(),
          createdAt: todayStr()
        };
        set(state => ({
          habits: [...state.habits, newHabit],
          settings: {
            ...state.settings,
            cardOrder: [...state.settings.cardOrder, newHabit.id]
          }
        }));
      },

      updateHabit: (id, updates) => {
        set(state => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
        }));
      },

      deleteHabit: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
          checkIns: state.checkIns.filter(c => c.habitId !== id),
          badges: state.badges.filter(b => b.habitId !== id),
          settings: {
            ...state.settings,
            cardOrder: state.settings.cardOrder.filter(cid => cid !== id)
          }
        }));
      },

      toggleCheckIn: (habitId, date, note = '', isBackfilled = false) => {
        const state = get();
        const existing = getCheckInByDate(habitId, date, state.checkIns);

        let newCheckIns: CheckIn[];
        if (existing) {
          newCheckIns = state.checkIns.map(c =>
            c.id === existing.id
              ? { ...c, completed: !c.completed, note, isBackfilled }
              : c
          );
        } else {
          newCheckIns = [
            ...state.checkIns,
            {
              id: generateId(),
              habitId,
              date,
              completed: true,
              note,
              isBackfilled
            }
          ];
        }

        const willComplete = !existing || !existing.completed;
        let newBadges: Badge[] = [];

        if (willComplete) {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit) {
            const tempCheckIns = newCheckIns;
            newBadges = checkBadgesToUnlock(habit, tempCheckIns, state.badges);
          }
        }

        set({
          checkIns: newCheckIns,
          badges: [...state.badges, ...newBadges],
          newlyUnlockedBadges: newBadges
        });
      },

      updateCheckInNote: (checkInId, note) => {
        set(state => ({
          checkIns: state.checkIns.map(c =>
            c.id === checkInId ? { ...c, note } : c
          )
        }));
      },

      reorderCards: (newOrder) => {
        set(state => ({
          settings: { ...state.settings, cardOrder: newOrder }
        }));
      },

      toggleDarkMode: () => {
        set(state => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode }
        }));
      },

      exportData: () => {
        const state = get();
        exportToCSV(state.habits, state.checkIns, state.badges);
      },

      clearNewBadges: () => {
        set({ newlyUnlockedBadges: [] });
      }
    }),
    {
      name: 'habit-tracker-data'
    }
  )
);
