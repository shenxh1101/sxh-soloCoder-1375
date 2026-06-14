import type { Habit, CheckIn, Badge, GoalType, Frequency } from '@/types';
import { formatDisplayDate, parseDisplayDate } from './date';
import { generateId } from './badges';

export interface ImportPreview {
  habits: Habit[];
  checkIns: CheckIn[];
  badges: Badge[];
  habitCount: number;
  checkInCount: number;
  badgeCount: number;
}

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
  const header = ['ID', '名称', '图标', '颜色', '频率', '目标次数', '分组', '优先级', '目标类型', '目标数值', '数值单位', '创建日期'];
  const rows = habits.map(h => [
    h.id,
    h.name,
    h.icon,
    h.color,
    h.frequency === 'daily' ? '每天' : '每周',
    h.targetCount.toString(),
    h.group,
    h.priority.toString(),
    h.goalType === 'boolean' ? '是/否' : '数值',
    h.goalValue.toString(),
    h.goalUnit || '',
    formatDisplayDate(h.createdAt)
  ]);

  return [header, ...rows].map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
};

const generateCheckInsCSV = (habits: Habit[], checkIns: CheckIn[]): string => {
  const header = ['ID', '习惯名称', '习惯ID', '日期', '是否完成', '是否补签', '数值', '备注'];
  const habitMap = new Map(habits.map(h => [h.id, h.name]));
  const rows = checkIns.map(c => [
    c.id,
    habitMap.get(c.habitId) || '未知',
    c.habitId,
    formatDisplayDate(c.date),
    c.completed ? '是' : '否',
    c.isBackfilled ? '是' : '否',
    c.value?.toString() || '',
    c.note || ''
  ]);

  return [header, ...rows].map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
};

const generateBadgesCSV = (habits: Habit[], badges: Badge[]): string => {
  const header = ['ID', '习惯名称', '习惯ID', '徽章类型', '徽章名称', '描述', '解锁日期'];
  const habitMap = new Map(habits.map(h => [h.id, h.name]));
  const rows = badges.map(b => [
    b.id,
    habitMap.get(b.habitId) || '未知',
    b.habitId,
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

const unescapeCSV = (value: string): string => {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result.map(unescapeCSV);
};

export const parseImportCSV = async (file: File): Promise<ImportPreview> => {
  const text = await file.text();
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);

  const sections: Record<string, string[][]> = {};
  let currentSection = '';

  for (const line of lines) {
    if (!line.trim()) continue;
    const sectionMatch = line.match(/^===\s*(.+?)\s*===$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = [];
      continue;
    }
    if (currentSection) {
      sections[currentSection].push(parseCSVLine(line));
    }
  }

  const habits: Habit[] = [];
  const habitIdMap = new Map<string, string>();
  const habitRows = sections['习惯列表'] || [];
  if (habitRows.length > 1) {
    for (let i = 1; i < habitRows.length; i++) {
      const row = habitRows[i];
      if (row.length < 8) continue;
      const [
        oldId, name, icon, color, freqStr, targetCountStr, group, priorityStr,
        goalTypeStr, goalValueStr, goalUnit, createdAtStr
      ] = row;

      const newId = generateId();
      habitIdMap.set(oldId || '', newId);

      const frequency: Frequency = freqStr === '每周' || freqStr === 'weekly' ? 'weekly' : 'daily';
      const goalType: GoalType = goalTypeStr === '数值' || goalTypeStr === 'numeric' ? 'numeric' : 'boolean';

      habits.push({
        id: newId,
        name: name || '未命名习惯',
        icon: icon || 'Star',
        color: color || '#FF6B6B',
        frequency,
        targetCount: parseInt(targetCountStr) || 1,
        group: group || '未分组',
        priority: parseInt(priorityStr) || 3,
        goalType,
        goalValue: parseFloat(goalValueStr) || 1,
        goalUnit: goalUnit || '',
        createdAt: parseDisplayDate(createdAtStr) || new Date().toISOString().split('T')[0]
      });
    }
  }

  const checkIns: CheckIn[] = [];
  const checkInRows = sections['打卡记录'] || [];
  if (checkInRows.length > 1) {
    for (let i = 1; i < checkInRows.length; i++) {
      const row = checkInRows[i];
      if (row.length < 5) continue;
      let [id, habitName, habitId, dateStr, completedStr, backfilledStr, valueStr, note] = row;
      if (row.length === 6) {
        [id, habitName, dateStr, completedStr, backfilledStr, note] = row;
        habitId = habits.find(h => h.name === habitName)?.id || '';
      }

      const mappedHabitId = habitIdMap.get(habitId || '') || habits.find(h => h.name === habitName)?.id || '';
      if (!mappedHabitId) continue;

      checkIns.push({
        id: generateId(),
        habitId: mappedHabitId,
        date: parseDisplayDate(dateStr) || new Date().toISOString().split('T')[0],
        completed: completedStr === '是' || completedStr === 'true',
        note: note || '',
        isBackfilled: backfilledStr === '是' || backfilledStr === 'true',
        value: valueStr ? parseFloat(valueStr) : undefined
      });
    }
  }

  const badges: Badge[] = [];
  const badgeRows = sections['徽章记录'] || [];
  if (badgeRows.length > 1) {
    for (let i = 1; i < badgeRows.length; i++) {
      const row = badgeRows[i];
      if (row.length < 5) continue;
      let [id, habitName, habitId, type, badgeName, description, unlockedAtStr] = row;
      if (row.length === 5) {
        [id, habitName, type, badgeName, description, unlockedAtStr] = row;
        habitId = habits.find(h => h.name === habitName)?.id || '';
      }

      const mappedHabitId = habitIdMap.get(habitId || '') || habits.find(h => h.name === habitName)?.id || '';
      if (!mappedHabitId) continue;

      badges.push({
        id: generateId(),
        habitId: mappedHabitId,
        type: type as any,
        name: badgeName,
        description,
        unlockedAt: parseDisplayDate(unlockedAtStr) || new Date().toISOString().split('T')[0]
      });
    }
  }

  return {
    habits,
    checkIns,
    badges,
    habitCount: habits.length,
    checkInCount: checkIns.length,
    badgeCount: badges.length
  };
};

export const mergeImportData = (
  existing: { habits: Habit[]; checkIns: CheckIn[]; badges: Badge[] },
  imported: ImportPreview,
  mode: 'overwrite' | 'merge'
) => {
  if (mode === 'overwrite') {
    return {
      habits: imported.habits,
      checkIns: imported.checkIns,
      badges: imported.badges
    };
  }

  const existingHabitNames = new Set(existing.habits.map(h => h.name));
  const newHabits = imported.habits.filter(h => !existingHabitNames.has(h.name));
  const allHabits = [...existing.habits, ...newHabits];

  const habitNameToId = new Map(allHabits.map(h => [h.name, h.id]));
  const existingCheckInKeys = new Set(existing.checkIns.map(c => `${c.habitId}|${c.date}`));

  const newCheckIns = imported.checkIns.filter(c => {
    const mappedId = habitNameToId.get(
      imported.habits.find(h => h.id === c.habitId)?.name || ''
    ) || c.habitId;
    return !existingCheckInKeys.has(`${mappedId}|${c.date}`);
  }).map(c => {
    const mappedId = habitNameToId.get(
      imported.habits.find(h => h.id === c.habitId)?.name || ''
    );
    return mappedId ? { ...c, habitId: mappedId } : c;
  });

  const existingBadgeKeys = new Set(existing.badges.map(b => `${b.habitId}|${b.type}`));
  const newBadges = imported.badges.filter(b => {
    const mappedId = habitNameToId.get(
      imported.habits.find(h => h.id === b.habitId)?.name || ''
    ) || b.habitId;
    return !existingBadgeKeys.has(`${mappedId}|${b.type}`);
  }).map(b => {
    const mappedId = habitNameToId.get(
      imported.habits.find(h => h.id === b.habitId)?.name || ''
    );
    return mappedId ? { ...b, habitId: mappedId } : b;
  });

  return {
    habits: allHabits,
    checkIns: [...existing.checkIns, ...newCheckIns],
    badges: [...existing.badges, ...newBadges]
  };
};
