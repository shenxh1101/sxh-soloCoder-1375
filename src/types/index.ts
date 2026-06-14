export type Frequency = 'daily' | 'weekly';

export type BadgeType = 'streak_7' | 'streak_30' | 'monthly_perfect' | 'first_checkin';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
  targetCount: number;
  group: string;
  priority: number;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  note: string;
  isBackfilled: boolean;
}

export interface Badge {
  id: string;
  habitId: string;
  type: BadgeType;
  name: string;
  description: string;
  unlockedAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  cardOrder: string[];
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  monthlyCompletionRate: number;
  totalCheckIns: number;
  thisMonthCount: number;
  weeklyCount: number;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  completion: number;
}

export interface CompareDataPoint {
  name: string;
  value: number;
  color: string;
}

export const BADGE_CONFIG: Record<BadgeType, { name: string; description: string; icon: string }> = {
  first_checkin: {
    name: '初出茅庐',
    description: '完成第一次打卡，开启习惯之旅',
    icon: 'Sparkles'
  },
  streak_7: {
    name: '七日恒心',
    description: '连续打卡 7 天，养成习惯的开始',
    icon: 'Flame'
  },
  streak_30: {
    name: '月度达人',
    description: '连续打卡 30 天，习惯已融入生活',
    icon: 'Trophy'
  },
  monthly_perfect: {
    name: '完美月度',
    description: '本月完成率达到 100%',
    icon: 'Crown'
  }
};

export const HABIT_COLORS = [
  '#FF6B6B',
  '#FF8E53',
  '#4ECDC4',
  '#A66CFF',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FF6F91',
  '#00C9A7'
];

export const HABIT_ICONS = [
  'BookOpen',
  'Dumbbell',
  'Droplets',
  'Moon',
  'Sun',
  'Apple',
  'Brain',
  'Music',
  'Pencil',
  'Heart',
  'Zap',
  'Leaf',
  'Coffee',
  'Code',
  'Bike'
];
