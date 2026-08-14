import React, { useState, useMemo } from 'react';
import { formatDate, getBrasiliaDateString } from '../../lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Task, TaskDependency, Project } from '../../types';
import { calculateCPM, CPMResult } from '../../utils/cpmCalculator';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface GanttChartProps {
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
  onAddDependency: (predecessorId: string, successorId: string) => { success: boolean; error?: string };
  onDeleteDependency: (dependencyId: string) => void;
  onUpdateTaskDate?: (taskId: string, startDate: string, dueDate: string) => void;
}

type ScaleMode = 'day' | 'week' | 'month';

export const GanttChart: React.FC<GanttChartProps> = ({
  project,
  tasks,
  dependencies,
  onAddDependency,
  onDeleteDependency,
}) => {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('week');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [selectedPredId, setSelectedPredId] = useState<string>('');
  const [selectedSuccId, setSelectedSuccId] = useState<string>('');
  const [depError, setDepError] = useState<string | null>(null);

  // 1. Calculate CPM
  const cpmResult: CPMResult = useMemo(() => {
    return calculateCPM(tasks, dependencies);
  }, [tasks, dependencies]);

  // 2. Timeline date bounds
  const todayStr = getBrasiliaDateString();

  const timelineDates = useMemo(() => {
    if (tasks.length === 0) return [];

    let min = tasks[0].startDate || project.startDate;
    let max = tasks[0].dueDate || project.endDate;

    tasks.forEach((t) => {
      if (t.startDate && t.startDate < min) min = t.startDate;
      if (t.baselineStart && t.baselineStart < min) min = t.baselineStart;
      if (t.dueDate && t.dueDate > max) max = t.dueDate;
      if (t.baselineDue && t.baselineDue > max) max = t.baselineDue;
    });

    const start = new Date(min + 'T00:00:00');
    const end = new Date(max + 'T00:00:00');

    // Add padding days
    start.setDate(start.getDate() - 3);
    end.setDate(end.getDate() + 7);

    const dates: Date[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [tasks, project]);

  // Filter tasks if showCriticalOnly
  const displayedTasks = useMemo(() => {
    if (!showCriticalOnly) return tasks;
    return tasks.filter((t) => cpmResult.criticalPathTaskIds.includes(t.id));
  }, [tasks, showCriticalOnly, cpmResult]);

  // Helper date diffs
  const getDayOffset = (dateStr: string): number => {
    if (timelineDates.length === 0 || !dateStr) return 0;
    const firstDate = timelineDates[0];
    const targetDate = new Date(dateStr + 'T00:00:00');
    const diffTime = targetDate.getTime() - firstDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getDaySpan = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 1;
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  // Cell width based on scale
  const colWidth = scaleMode === 'day' ? 36 : scaleMode === 'week' ? 18 : 8;

  // 3. Indicators & KPIs
  const scheduleVarianceDays = useMemo(() => {
    // Calculate total delay / advance vs baseline
    let variance = 0;
    tasks.forEach((t) => {
      if (t.dueDate && t.baselineDue) {
        const dDue = new Date(t.dueDate + 'T00:00:00').getTime();
        const dBase = new Date(t.baselineDue + 'T00:00:00').getTime();
        variance += Math.round((dDue - dBase) / (1000 * 3600 * 24));
      }
    });
    return variance;
  }, [tasks]);

  const onTimeDeliveryRate = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'done');
    if (completed.length === 0) return 100;
    const onTime = completed.filter((t) => {
      const base = t.baselineDue || t.dueDate;
      return t.dueDate <= base;
    });
    return Math.round((onTime.length / completed.length) * 100);
  }, [tasks]);

  // Helper task status badge with icon + label (not color only)
  const renderTaskStatusIndicator = (t: Task) => {
    const isOverdue = t.dueDate < todayStr && t.status !== 'done';
    const isCritical = cpmResult.criticalPathTaskIds.includes(t.id);

    if (t.status === 'done') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" /> Concluído
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertTriangle className="w-3 h-3" /> Atrasado
        </span>
      );
    }
    if (isCritical) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
          <Flame className="w-3 h-3" /> Crítico
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <Clock className="w-3 h-3" /> Em Dia
      </span>
    );
  };

  const handleCreateDependency = (e: React.FormEvent) => {
    e.preventDefault();
    setDepError(null);

    if (!selectedPredId || !selectedSuccId) {
      setDepError('Selecione a tarefa predecessora e a tarefa sucessora.');
      return;
    }

    const res = onAddDependency(selectedPredId, selectedSuccId);
    if (!res.success) {
      setDepError(res.error || 'Erro ao adicionar dependência.');
    } else {
      setSelectedPredId('');
      setSelectedSuccId('');
      setIsDepModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel Top Stats & KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-indigo-600">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Duração do Cronograma
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {cpmResult.projectDurationDays ? `${cpmResult.projectDurationDays} dias` : '—'}
            </span>
            <span className="text-xs text-slate-500">
              {tasks.length} tarefas
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Início: {formatDate(project.startDate)} | Fim: {formatDate(project.endDate)}
          </p>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Variância de Cronograma
          </p>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-xl font-extrabold ${
                scheduleVarianceDays > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : scheduleVarianceDays < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {scheduleVarianceDays > 0
                ? `+${scheduleVarianceDays}d atraso`
                : scheduleVarianceDays < 0
                ? `${scheduleVarianceDays}d adiantado`
                : 'Em dia com baseline'}
            </span>
            {scheduleVarianceDays > 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Comparação com Baseline ({formatDate(project.baseline || project.endDate)})
          </p>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Taxa de Entrega no Prazo
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {onTimeDeliveryRate}%
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tarefas finalizadas sem estourar o baseline
          </p>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-l-4 border-l-rose-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Caminho Crítico (CPM)
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {cpmResult.isValid ? `${cpmResult.criticalPathTaskIds.length} tarefas` : 'Indisponível'}
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {cpmResult.isValid ? 'Folga (slack) = 0 dias' : 'Consulte aviso de consistência'}
          </p>
        </Card>
      </div>

      {/* CPM Notification / Warning if invalid */}
      {!cpmResult.isValid && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Cálculo CPM Indisponível</p>
            <p>{cpmResult.reason}</p>
            <p className="opacity-80">
              O cálculo do Caminho Crítico é suspenso para evitar resultados arbitrários até que os dados sejam corrigidos.
            </p>
          </div>
        </div>
      )}

      {/* Gantt Toolbar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setScaleMode('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                scaleMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-brand-accent dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setScaleMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                scaleMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-brand-accent dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setScaleMode('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                scaleMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-brand-accent dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            disabled={!cpmResult.isValid}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showCriticalOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            } ${!cpmResult.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Somente Caminho Crítico
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Legenda visual */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm bg-brand-accent inline-block" /> Atual
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1.5 rounded-sm bg-slate-400 dark:bg-slate-500 border border-dashed border-slate-600 inline-block" /> Baseline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" /> Crítico
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDepModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" /> Dependências ({dependencies.length})
          </Button>
        </div>
      </div>

      {/* Gantt Chart Table / Canvas */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex overflow-x-auto min-w-full">
          {/* Left Table Header & Task Info Column */}
          <div className="w-80 sm:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 z-10 sticky left-0 shadow-sm">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between h-12">
              <span>Tarefa & Responsável</span>
              <span className="text-[11px] font-normal text-slate-500">Progresso</span>
            </div>

            {/* Task Rows (Left side) */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {displayedTasks.map((t) => {
                const isCritical = cpmResult.criticalPathTaskIds.includes(t.id);
                const taskSlack = cpmResult.tasksResult[t.id]?.slack;

                return (
                  <div
                    key={t.id}
                    className={`p-3 h-16 flex flex-col justify-center gap-1 transition-colors ${
                      isCritical ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.progress}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-slate-400" /> {t.assignee}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {renderTaskStatusIndicator(t)}
                        {taskSlack !== undefined && (
                          <span
                            className="text-[10px] font-mono text-slate-500"
                            title={`Folga Total (Slack): ${taskSlack} dia(s)`}
                          >
                            s:{taskSlack}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {displayedTasks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhuma tarefa para exibir.
                </div>
              )}
            </div>
          </div>

          {/* Right Timeline Canvas Column */}
          <div className="flex-1 overflow-x-auto min-w-[600px] bg-white dark:bg-slate-900 relative">
            {/* Timeline Dates Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 h-12 bg-slate-50 dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {timelineDates.map((d, idx) => {
                const dateStr = d.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                const dayNum = d.getDate();
                const dayName = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                return (
                  <div
                    key={dateStr}
                    style={{ minWidth: `${colWidth}px`, width: `${colWidth}px` }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/60 ${
                      isToday ? 'bg-indigo-100/70 dark:bg-indigo-950/80 font-bold text-indigo-700 dark:text-indigo-300' : ''
                    } ${isWeekend ? 'bg-slate-100/40 dark:bg-slate-800/20' : ''}`}
                  >
                    <span className="text-[9px] uppercase tracking-tighter opacity-70">{dayName}</span>
                    <span className="text-[10px] font-mono">{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Rows for Bars */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 relative">
              {/* Vertical line indicator for Today */}
              {timelineDates.findIndex((d) => d.toISOString().split('T')[0] === todayStr) >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none"
                  style={{
                    left: `${
                      timelineDates.findIndex((d) => d.toISOString().split('T')[0] === todayStr) * colWidth + colWidth / 2
                    }px`,
                  }}
                  title="Hoje"
                >
                  <span className="absolute top-0 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-b">
                    Hoje
                  </span>
                </div>
              )}

              {displayedTasks.map((t) => {
                const isCritical = cpmResult.criticalPathTaskIds.includes(t.id);
                const isOverdue = t.dueDate < todayStr && t.status !== 'done';

                // Calculate Bar position
                const startOffset = getDayOffset(t.startDate);
                const spanDays = getDaySpan(t.startDate, t.dueDate);

                const barLeft = startOffset * colWidth;
                const barWidth = Math.max(colWidth, spanDays * colWidth);

                // Baseline Bar position
                const baseStartOffset = t.baselineStart ? getDayOffset(t.baselineStart) : startOffset;
                const baseSpanDays = t.baselineStart && t.baselineDue ? getDaySpan(t.baselineStart, t.baselineDue) : spanDays;
                const baseBarLeft = baseStartOffset * colWidth;
                const baseBarWidth = Math.max(colWidth, baseSpanDays * colWidth);

                // Task dependencies
                const taskPreds = dependencies
                  .filter((d) => d.successorId === t.id)
                  .map((d) => tasks.find((tk) => tk.id === d.predecessorId))
                  .filter(Boolean) as Task[];

                return (
                  <div key={t.id} className="h-16 relative flex items-center">
                    {/* Baseline Bar (Ghost representation underneath) */}
                    <div
                      style={{ left: `${baseBarLeft}px`, width: `${baseBarWidth}px` }}
                      className="absolute bottom-1.5 h-2 rounded bg-slate-300/80 dark:bg-slate-700/80 border border-dashed border-slate-500/70 z-0"
                      title={`Baseline: ${formatDate(t.baselineStart || t.startDate)} até ${formatDate(t.baselineDue || t.dueDate)}`}
                    />

                    {/* Current Task Bar */}
                    <div
                      style={{ left: `${barLeft}px`, width: `${barWidth}px` }}
                      className={`absolute top-2.5 h-7 rounded-lg shadow-xs flex items-center overflow-hidden z-10 transition-all ${
                        isCritical
                          ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                          : isOverdue
                          ? 'bg-rose-600 text-white'
                          : t.status === 'done'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-accent text-white'
                      }`}
                    >
                      {/* Progress filled portion */}
                      <div
                        style={{ width: `${t.progress}%` }}
                        className={`h-full transition-all ${
                          t.status === 'done'
                            ? 'bg-emerald-700'
                            : isCritical
                            ? 'bg-rose-700'
                            : 'bg-indigo-800'
                        }`}
                      />

                      {/* Content inside or alongside bar */}
                      <div className="absolute inset-0 px-2 flex items-center justify-between text-[10px] font-bold tracking-tight truncate pointer-events-none">
                        <span className="truncate">{t.code}</span>
                        <span>{t.progress}%</span>
                      </div>
                    </div>

                    {/* Task dependency tags alongside bar */}
                    {taskPreds.length > 0 && (
                      <div
                        style={{ left: `${barLeft + barWidth + 8}px` }}
                        className="absolute text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 z-10 whitespace-nowrap font-mono"
                      >
                        <span className="text-slate-400">← Dep:</span>
                        {taskPreds.map((p) => (
                          <span
                            key={p.id}
                            className="px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700"
                          >
                            {p.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal / Panel: Gerenciar Dependências (Finish-to-Start) com Detecção de Ciclo */}
      {isDepModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Dependências entre Tarefas (Gantt)
              </h3>
              <button
                onClick={() => setIsDepModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {depError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{depError}</span>
              </div>
            )}

            {/* Form Nova Dependência */}
            <form onSubmit={handleCreateDependency} className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Adicionar Dependência Termino-para-Início (Finish-to-Start)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Tarefa Antecessora (Predecessora)
                  </label>
                  <select
                    value={selectedPredId}
                    onChange={(e) => setSelectedPredId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">Selecione a tarefa...</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Tarefa Sucessora (Dependente)
                  </label>
                  <select
                    value={selectedSuccId}
                    onChange={(e) => setSelectedSuccId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">Selecione a tarefa...</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Salvar Dependência
                </Button>
              </div>
            </form>

            {/* List of existing dependencies */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dependências Cadastradas no Projeto
              </h4>

              {dependencies.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhuma dependência cadastrada ainda.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {dependencies.map((dep) => {
                    const pred = tasks.find((t) => t.id === dep.predecessorId);
                    const succ = tasks.find((t) => t.id === dep.successorId);

                    return (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {pred?.code || dep.predecessorId}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {succ?.code || dep.successorId}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {dep.type}
                          </span>
                        </div>

                        <button
                          onClick={() => onDeleteDependency(dep.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Remover Dependência"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsDepModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
