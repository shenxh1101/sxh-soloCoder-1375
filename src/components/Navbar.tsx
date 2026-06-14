import { Sun, Moon, Download, Plus, Award, ArrowUpDown, UploadCloud } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface NavbarProps {
  onAddHabit: () => void;
  onShowBadges: () => void;
  onImport: () => void;
  sortBy: 'order' | 'priority' | 'group';
  onSortChange: (sort: 'order' | 'priority' | 'group') => void;
}

export const Navbar = ({ onAddHabit, onShowBadges, onImport, sortBy, onSortChange }: NavbarProps) => {
  const { settings, toggleDarkMode, exportData, badges } = useAppStore();

  const sortOptions: { value: 'order' | 'priority' | 'group'; label: string }[] = [
    { value: 'order', label: '自定义' },
    { value: 'priority', label: '优先级' },
    { value: 'group', label: '分组' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass border-b border-slate-200/50 dark:border-slate-700/50 animate-fade-in">
      <div className="container py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-grad-primary flex items-center justify-center shadow-soft">
            <span className="text-white text-lg font-bold">H</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-500 to-warm-500 bg-clip-text text-transparent">
              习惯追踪器
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
              坚持每一天，成就更好的自己
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown size={14} />
              排序:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="text-xs bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onShowBadges}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
            title="徽章墙"
          >
            <Award
              size={18}
              className="text-warm-500 group-hover:scale-110 transition-transform"
            />
            {badges.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-grad-primary text-[10px] font-bold text-white flex items-center justify-center">
                {badges.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onImport}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
              title="导入 CSV 备份"
            >
              <UploadCloud
                size={18}
                className="text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform"
              />
            </button>

            <button
              onClick={exportData}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
              title="导出 CSV"
            >
              <Download
                size={18}
                className="text-accent-600 group-hover:scale-110 transition-transform"
              />
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
            title={settings.darkMode ? '切换浅色' : '切换深色'}
          >
            {settings.darkMode ? (
              <Sun size={18} className="text-warm-500 group-hover:rotate-180 transition-all duration-500" />
            ) : (
              <Moon size={18} className="text-indigo-500 group-hover:-rotate-12 transition-all duration-300" />
            )}
          </button>

          <button
            onClick={onAddHabit}
            className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap shadow-brand-500/30"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新增习惯</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
