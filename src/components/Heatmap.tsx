import { useState } from 'react';
import { useHeatmapData } from '@/hooks/useHabitStats';
import { format } from 'date-fns';
import { getWeekdayLabels } from '@/utils/date';

interface HeatmapProps {
  habitId: string;
  checkIns: any[];
  color?: string;
  weeks?: number;
  onCellClick?: (date: string) => void;
}

export const Heatmap = ({ habitId, checkIns, color = '#4ECDC4', weeks = 12, onCellClick }: HeatmapProps) => {
  const { grid, weekCount, getCellLevel, getCellDate, getCellNote } = useHeatmapData(habitId, checkIns, weeks);
  const weekdayLabels = getWeekdayLabels();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; visible: boolean }>({
    x: 0,
    y: 0,
    text: '',
    visible: false
  });

  const getCellColor = (level: number): string => {
    if (level === 0) {
      return 'bg-slate-100 dark:bg-slate-700/50';
    }
    const opacity = level === 3 ? 0.35 : level === 4 ? 1 : level / 5;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `bg-[rgba(${r},${g},${b},${0.2 + opacity * 0.8})]`;
  };

  const handleMouseEnter = (e: React.MouseEvent, date: Date | null) => {
    if (!date) return;
    const cellDate = getCellDate(date);
    const note = getCellNote(date);
    const level = getCellLevel(date);
    const status = level > 0 ? (level === 4 ? '✓ 完成 (有备注)' : '✓ 完成') : '未完成';
    const text = `${format(date, 'M月d日')} · ${status}${note ? `\n📝 ${note}` : ''}`;

    const rect = e.currentTarget.getBoundingClientRect();
    const parent = e.currentTarget.closest('.relative');
    const parentRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };

    setTooltip({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
      text,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleClick = (date: Date | null) => {
    if (!date || !onCellClick) return;
    const cellDate = getCellDate(date);
    if (cellDate) onCellClick(cellDate);
  };

  return (
    <div className="relative">
      <div className="flex gap-1 mb-1.5">
        <div className="w-6" />
        <div className="flex-1 flex gap-[3px]">
          {Array.from({ length: weekCount }).map((_, wi) => {
            const firstDateOfWeek = grid[0]?.[wi];
            if (!firstDateOfWeek) return <div key={wi} className="flex-1" />;
            const shouldShow = wi === 0 || firstDateOfWeek.getDate() <= 7;
            return (
              <div
                key={wi}
                className="flex-1 text-[9px] text-slate-400 dark:text-slate-500 h-3 overflow-hidden"
              >
                {shouldShow ? `${firstDateOfWeek.getMonth() + 1}月` : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-[3px] w-6 justify-around pr-1">
          {weekdayLabels.map((label, i) => (
            <span
              key={i}
              className={`text-[10px] text-slate-400 dark:text-slate-500 h-[11px] leading-[11px] ${i % 2 === 1 ? '' : 'opacity-0'}`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const level = getCellLevel(cell);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square rounded-[3px] cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 ${getCellColor(level)} ${!cell ? 'opacity-0 pointer-events-none' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, cell)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(cell)}
                />
              );
            })
          )}
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="tooltip visible whitespace-pre-line text-center"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            maxWidth: '180px'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
