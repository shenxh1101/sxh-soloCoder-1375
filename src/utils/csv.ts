import type { Habit, CheckIn, Badge } from '@/types';
import { formatDisplayDate } from './date';

export const exportToCSV = (habits: Habit[], checkIns: CheckIn[], badges: Badge[]): void => {
  const habitsCSV = generateHabitsCSV(habits);
  const checkInsCSV = generateCheckInsCSV(habits, checkIns);
  const badgesCSV = generateBadgesCSV(habits, badges);

  const combinedCSV = [
    '=== 习惯列表 ===',
    habitsCSV,
    '',
    '=== 打卡记录 ===',
    checkInsCSV,
    '',
    '=== 徽章记录 ===',
    badgesCSV
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateHabitsCSV = (habits: Habit[]): string => {
  const header = ['ID', '名称', '图标', '频率', '目标次数', '分组', '优先级', '创建日期'];
  const rows = habits.map(h => [
    h.id,
    h.name,
    h.icon,
    h.frequency === 'daily' ? '每天' : '每周',
    h.targetCount.toString(),
    h.group,
    h.priority.toString(),
    formatDisplayDate(h.createdAt)
  ]);

  return [header, ...rows].map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
};

const generateCheckInsCSV = (habits: Habit[], checkIns: CheckIn[]): string => {
  const header = ['ID', '习惯名称', '日期', '是否完成', '是否补签', '备注'];
  const habitMap = new Map(habits.map(h => [h.id, h.name]));
  const rows = checkIns.map(c => [
    c.id,
    habitMap.get(c.habitId) || '未知',
    formatDisplayDate(c.date),
    c.completed ? '是' : '否',
    c.isBackfilled ? '是' : '否',
    c.note || ''
  ]);

  return [header, ...rows].map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
};

const generateBadgesCSV = (habits: Habit[], badges: Badge[]): string => {
  const header = ['ID', '习惯名称', '徽章类型', '徽章名称', '描述', '解锁日期'];
  const habitMap = new Map(habits.map(h => [h.id, h.name]));
  const rows = badges.map(b => [
    b.id,
    habitMap.get(b.habitId) || '未知',
    b.type,
    b.name,
    b.description,
    formatDisplayDate(b.unlockedAt)
  ]);

  return [header, ...rows].map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
};

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};
