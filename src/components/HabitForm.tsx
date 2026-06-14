import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import type { Habit, Frequency } from '@/types';
import { HABIT_COLORS, HABIT_ICONS } from '@/types';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  editHabit?: Habit | null;
}

const DEFAULT_GROUPS = ['自我提升', '健康生活', '作息规律', '工作学习', '兴趣爱好'];

export const HabitForm = ({ isOpen, onClose, onSubmit, editHabit }: HabitFormProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [group, setGroup] = useState(DEFAULT_GROUPS[0]);
  const [customGroup, setCustomGroup] = useState('');
  const [useCustomGroup, setUseCustomGroup] = useState(false);
  const [priority, setPriority] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setIcon(editHabit.icon);
      setColor(editHabit.color);
      setFrequency(editHabit.frequency);
      setTargetCount(editHabit.targetCount);
      if (DEFAULT_GROUPS.includes(editHabit.group)) {
        setGroup(editHabit.group);
        setUseCustomGroup(false);
      } else {
        setCustomGroup(editHabit.group);
        setUseCustomGroup(true);
      }
      setPriority(editHabit.priority);
    } else {
      setName('');
      setIcon(HABIT_ICONS[0]);
      setColor(HABIT_COLORS[0]);
      setFrequency('daily');
      setTargetCount(1);
      setGroup(DEFAULT_GROUPS[0]);
      setCustomGroup('');
      setUseCustomGroup(false);
      setPriority(3);
    }
    setErrors({});
  }, [editHabit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '请输入习惯名称';
    }

    const finalGroup = useCustomGroup ? customGroup.trim() : group;
    if (!finalGroup) {
      newErrors.group = '请选择或输入分组';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      icon,
      color,
      frequency,
      targetCount,
      group: finalGroup,
      priority
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg animate-bounce-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl">
          <h2 className="text-lg font-bold">
            {editHabit ? '编辑习惯' : '新增习惯'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">习惯名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：每天阅读 30 分钟"
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">选择图标</label>
            <div className="grid grid-cols-8 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              {HABIT_ICONS.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${isSelected
                        ? 'text-white shadow-soft'
                        : 'text-slate-500 hover:bg-white dark:hover:bg-slate-600'
                      }`}
                    style={isSelected ? { backgroundColor: color } : {}}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">主题颜色</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">频率</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${frequency === 'daily'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  style={frequency === 'daily' ? { backgroundColor: color } : {}}
                >
                  每天
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${frequency === 'weekly'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  style={frequency === 'weekly' ? { backgroundColor: color } : {}}
                >
                  每周
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                目标次数 / {frequency === 'daily' ? '天' : '周'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                  className="w-10 h-[42px] rounded-xl bg-slate-100 dark:bg-slate-700 text-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={frequency === 'daily' ? 10 : 14}
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(1, Math.min(frequency === 'daily' ? 10 : 14, parseInt(e.target.value) || 1)))}
                  className="flex-1 h-[42px] text-center rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-bold text-lg"
                />
                <button
                  type="button"
                  onClick={() => setTargetCount(Math.min(frequency === 'daily' ? 10 : 14, targetCount + 1))}
                  className="w-10 h-[42px] rounded-xl bg-slate-100 dark:bg-slate-700 text-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">分组 *</label>
              <button
                type="button"
                onClick={() => setUseCustomGroup(!useCustomGroup)}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                {useCustomGroup ? '选择预设' : '自定义分组'}
              </button>
            </div>

            {useCustomGroup ? (
              <input
                type="text"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="输入自定义分组名"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all ${errors.group ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {DEFAULT_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(g)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${group === g
                        ? 'text-white shadow-soft'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    style={group === g ? { backgroundColor: color } : {}}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
            {errors.group && (
              <p className="mt-1 text-xs text-red-500">{errors.group}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              优先级：<span className="font-bold" style={{ color }}>{priority}/5</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">低</span>
              <div className="flex-1 flex gap-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 h-10 rounded-lg transition-all ${priority >= p ? 'shadow-soft' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    style={priority >= p ? { backgroundColor: color, opacity: 0.3 + (p / 5) * 0.7 } : {}}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">高</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-medium shadow-soft transition-all hover:shadow-soft-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: color }}
            >
              {editHabit ? '保存修改' : '创建习惯'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
