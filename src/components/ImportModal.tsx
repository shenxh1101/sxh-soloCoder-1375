import { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Check, FileWarning, Merge, Trash2, Info } from 'lucide-react';
import type { Habit, CheckIn, Badge } from '@/types';
import type { ImportPreview } from '@/utils/csv';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseFile: (file: File) => Promise<ImportPreview>;
  onApply: (preview: ImportPreview, mode: 'overwrite' | 'merge') => void;
  currentHabitCount: number;
  currentCheckInCount: number;
  currentBadgeCount: number;
}

export const ImportModal = ({
  isOpen,
  onClose,
  onParseFile,
  onApply,
  currentHabitCount,
  currentCheckInCount,
  currentBadgeCount
}: ImportModalProps) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mode, setMode] = useState<'overwrite' | 'merge'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setMode('merge');
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setIsLoading(true);
    setError(null);

    try {
      const result = await onParseFile(f);
      if (result.habitCount === 0 && result.checkInCount === 0 && result.badgeCount === 0) {
        setError('未解析到有效数据，请检查文件格式');
        return;
      }
      setPreview(result);
      setStep('preview');
    } catch (err: any) {
      setError(err?.message || '文件解析失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('仅支持 CSV 文件');
      return;
    }
    setFile(f);
    setIsLoading(true);
    setError(null);

    try {
      const result = await onParseFile(f);
      if (result.habitCount === 0 && result.checkInCount === 0 && result.badgeCount === 0) {
        setError('未解析到有效数据，请检查文件格式');
        return;
      }
      setPreview(result);
      setStep('preview');
    } catch (err: any) {
      setError(err?.message || '文件解析失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!preview) return;
    onApply(preview, mode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-soft-lg animate-bounce-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/15 text-brand-500">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="font-bold">导入数据备份</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'upload' ? '选择 CSV 文件开始导入' : '请确认导入内容'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[calc(90vh-80px)] overflow-y-auto">
          {step === 'upload' ? (
            <>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  error
                    ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">正在解析文件...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/15 to-warm-500/15 flex items-center justify-center">
                      <UploadCloud size={28} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {file ? file.name : '点击或拖拽 CSV 文件到此处'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        支持本应用导出的 CSV 备份文件
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">解析失败</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-4 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <Info size={14} /> 导入须知
                </p>
                <ul className="space-y-1.5 text-slate-500 dark:text-slate-400 ml-5.5 list-disc">
                  <li>合并模式：同名习惯跳过不导入，避免重复数据合并（按日期去重）</li>
                  <li>覆盖模式：完全替换当前所有数据，请谨慎操作</li>
                  <li>建议先导出一份当前数据备份再执行导入</li>
                </ul>
              </div>
            </>
          ) : (
            preview &&
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  文件内容预览
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="习惯"
                    current={currentHabitCount}
                    imported={preview.habitCount}
                    icon={<FileText size={16} />}
                    color="text-brand-500"
                    bg="bg-brand-500/15"
                  />
                  <StatCard
                    label="打卡记录"
                    current={currentCheckInCount}
                    imported={preview.checkInCount}
                    icon={<CheckCircle2 size={16} />}
                    color="text-accent-500"
                    bg="bg-accent-500/15"
                  />
                  <StatCard
                    label="徽章"
                    current={currentBadgeCount}
                    imported={preview.badgeCount}
                    icon={<AwardWrapper />}
                    color="text-warm-500"
                    bg="bg-warm-500/15"
                  />
                </div>
              </div>

              {preview.habits.slice(0, 5).length > 0 && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <p className="text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                    习惯列表（{preview.habits.length > 5 ? `前 5 个共 ${preview.habits.length}` : '全部'}）
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-40 overflow-y-auto">
                    {preview.habits.slice(0, 5).map((h: Habit) => (
                      <div key={h.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{h.name}</span>
                        <span className="ml-auto text-slate-400">{h.group}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <p className="text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                  导入模式
                </p>
                <div className="p-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('merge')}
                    className={`p-3 rounded-xl text-left border-2 transition-all ${
                      mode === 'merge'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                        mode === 'merge' ? 'bg-brand-500' : 'bg-slate-400'
                      }`}>
                        <Merge size={16} />
                      </div>
                      <p className={`text-sm font-bold ${
                        mode === 'merge' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        合并导入
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      保留现有数据，新增习惯和不重复的打卡
                    </p>
                    {mode === 'merge' && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-500">
                        <Check size={12} /> 推荐使用
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('overwrite')}
                    className={`p-3 rounded-xl text-left border-2 transition-all ${
                      mode === 'overwrite'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                        mode === 'overwrite' ? 'bg-red-500' : 'bg-slate-400'
                      }`}>
                        <Trash2 size={16} />
                      </div>
                      <p className={`text-sm font-bold ${
                        mode === 'overwrite' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        覆盖导入
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      清空现有数据，完全替换为导入内容
                    </p>
                    {mode === 'overwrite' && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500">
                        <FileWarning size={12} /> 现有数据将丢失
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 px-5 py-4">
          {step === 'upload' ? (
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
          ) : (
            <button
              onClick={() => { setStep('upload'); setFile(null); setPreview(null); }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              重新选择
            </button>
          )}
          {step === 'preview' && (
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-medium shadow-soft transition-all hover:shadow-soft-lg bg-gradient-to-r from-brand-500 to-warm-500"
            >
              确认导入
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label, current, imported, icon, color, bg }: {
  label: string;
  current: number;
  imported: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) => (
  <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-700/30 space-y-2">
    <div className="flex items-center gap-1.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
    </div>
    <div className="leading-tight">
      <div className="text-xl font-bold text-slate-700 dark:text-slate-200">+{imported}</div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400">当前 {current}</div>
    </div>
  </div>
);

const AwardWrapper = () => {
  const { Award } = require('lucide-react');
  return <Award size={16} />;
};
