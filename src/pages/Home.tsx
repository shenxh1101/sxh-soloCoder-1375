import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { useAppStore } from '@/store/useAppStore';
import { useSortedHabits } from '@/hooks/useHabitStats';
import { todayStr } from '@/utils/date';
import type { Habit } from '@/types';

import { Navbar } from '@/components/Navbar';
import { StatsOverview } from '@/components/StatsOverview';
import { TrendChart } from '@/components/TrendChart';
import { CompareChart } from '@/components/CompareChart';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { CheckInModal } from '@/components/CheckInModal';
import { BadgeGallery } from '@/components/BadgeGallery';
import { SharePoster } from '@/components/SharePoster';
import { BadgeNotification } from '@/components/BadgeNotification';
import { ArrowUpDown, Plus } from 'lucide-react';

export default function Home() {
  const {
    habits,
    checkIns,
    badges,
    settings,
    newlyUnlockedBadges,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheckIn,
    reorderCards,
    clearNewBadges
  } = useAppStore();

  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'group'>('order');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);
  const [checkInInitialDate, setCheckInInitialDate] = useState<string | undefined>();
  const [showBadgeGallery, setShowBadgeGallery] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [posterHabit, setPosterHabit] = useState<Habit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const sortedHabits = useSortedHabits(habits, settings.cardOrder, sortBy);
  const today = todayStr();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && sortBy === 'order') {
      const oldIndex = sortedHabits.findIndex(h => h.id === active.id);
      const newIndex = sortedHabits.findIndex(h => h.id === over.id);
      const newOrder = arrayMove(sortedHabits.map(h => h.id), oldIndex, newIndex);
      reorderCards(newOrder);
    }
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setShowHabitForm(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleHabitSubmit = (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
    setShowDeleteConfirm(null);
  };

  const handleToggleCheckIn = (habitId: string, date?: string) => {
    const targetDate = date || today;
    toggleCheckIn(habitId, targetDate, '', targetDate !== today);
  };

  const handleOpenCheckInModal = (habit: Habit, initialDate?: string) => {
    setCheckInHabit(habit);
    setCheckInInitialDate(initialDate);
    setShowCheckInModal(true);
  };

  const handleGeneratePoster = (habit: Habit) => {
    setPosterHabit(habit);
    setShowPoster(true);
  };

  const activeHabit = activeId ? habits.find(h => h.id === activeId) : null;

  return (
    <div className="min-h-screen">
      <Navbar
        onAddHabit={handleAddHabit}
        onShowBadges={() => setShowBadgeGallery(true)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <BadgeNotification
        badges={newlyUnlockedBadges}
        habits={habits}
        onClose={clearNewBadges}
      />

      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8">
        <StatsOverview
          habits={habits}
          checkIns={checkIns}
          badges={badges}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TrendChart habits={habits} checkIns={checkIns} days={14} />
          <CompareChart habits={habits} checkIns={checkIns} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold">我的习惯</h2>
              <span className="badge-pill bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs">
                共 {habits.length} 个
              </span>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
              >
                <option value="order">自定义</option>
                <option value="priority">优先级</option>
                <option value="group">分组</option>
              </select>
              <button
                onClick={handleAddHabit}
                className="p-2 rounded-xl bg-grad-primary text-white shadow-soft"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="card p-12 text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/10 to-warm-500/10 flex items-center justify-center mb-4">
                <Plus size={36} className="text-brand-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">还没有习惯</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
                开始创建你的第一个习惯吧，每一个伟大的成就都始于第一步
              </p>
              <button onClick={handleAddHabit} className="btn-primary">
                <Plus size={18} />
                创建第一个习惯
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedHabits.map(h => h.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {sortedHabits.map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      checkIns={checkIns}
                      index={index}
                      onToggleCheckIn={(date) => handleToggleCheckIn(habit.id, date)}
                      onEdit={() => handleEditHabit(habit)}
                      onDelete={() => setShowDeleteConfirm(habit.id)}
                      onOpenCheckInModal={(initialDate) => handleOpenCheckInModal(habit, initialDate)}
                      onGeneratePoster={() => handleGeneratePoster(habit)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeHabit ? (
                  <div className="opacity-80 scale-105 rotate-1 shadow-card-hover">
                    <HabitCard
                      habit={activeHabit}
                      checkIns={checkIns}
                      index={0}
                      onToggleCheckIn={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onOpenCheckInModal={() => {}}
                      onGeneratePoster={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
          数据已自动保存到本地 · 坚持就是胜利 💪
        </div>
      </main>

      <HabitForm
        isOpen={showHabitForm}
        onClose={() => { setShowHabitForm(false); setEditingHabit(null); }}
        onSubmit={handleHabitSubmit}
        editHabit={editingHabit}
      />

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => { setShowCheckInModal(false); setCheckInHabit(null); setCheckInInitialDate(undefined); }}
        habit={checkInHabit}
        checkIns={checkIns}
        onToggleCheckIn={toggleCheckIn}
        initialDate={checkInInitialDate}
      />

      <BadgeGallery
        isOpen={showBadgeGallery}
        onClose={() => setShowBadgeGallery(false)}
        badges={badges}
        habits={habits}
      />

      <SharePoster
        isOpen={showPoster}
        onClose={() => { setShowPoster(false); setPosterHabit(null); }}
        habit={posterHabit}
        checkIns={checkIns}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg p-6 animate-bounce-in">
            <h3 className="text-lg font-bold mb-2">确认删除？</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              删除习惯将同时删除所有相关的打卡记录和徽章，此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteHabit(showDeleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-soft"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
