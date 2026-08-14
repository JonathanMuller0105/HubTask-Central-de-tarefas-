import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  Briefcase,
  CheckSquare,
  Users,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Activity,
  Info,
  SlidersHorizontal,
  FolderPlus,
  Link as LinkIcon,
  X,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Progress } from '../components/ui/Progress';
import { useCalendar } from '../hooks/useCalendar';
import { useProjects } from '../hooks/useProjects';
import { CalendarEvent, CalendarEventType } from '../types';
import { addDaysToDateString, BRAZIL_LOCALE, BRAZIL_TIME_ZONE, formatDate, getBrasiliaDateString } from '../lib/utils';

export const Calendar: React.FC = () => {
  // Selected Date state (Defaults to today YYYY-MM-DD or 2026-08-12)
  const [selectedDate, setSelectedDate] = useState<string>(() => getBrasiliaDateString());
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'integrations'>('today');

  const {
    events,
    workdayHours,
    adapters,
    conflictMap,
    todayWorkload,
    getWorkloadForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    setWorkdayHours,
    prepareIntegration,
  } = useCalendar(selectedDate);

  const { allProjects, allTasks } = useProjects();

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isAdapterModalOpen, setIsAdapterModalOpen] = useState(false);
  const [selectedAdapterId, setSelectedAdapterId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    type: CalendarEventType;
    project_id: string;
    task_id: string;
    location: string;
  }>({
    title: '',
    description: '',
    date: getBrasiliaDateString(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting',
    project_id: '',
    task_id: '',
    location: '',
  });

  // Open Create Modal
  const handleOpenCreateModal = (type: CalendarEventType = 'meeting') => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: selectedDate,
      startTime: '09:00',
      endTime: '10:00',
      type,
      project_id: '',
      task_id: '',
      location: type === 'focus' ? 'Sessão de Foco' : '',
    });
    setIsEventModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description || '',
      date: evt.date,
      startTime: evt.startTime || '09:00',
      endTime: evt.endTime || '10:00',
      type: evt.type,
      project_id: evt.project_id || '',
      task_id: evt.task_id || '',
      location: evt.location || '',
    });
    setIsEventModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        project_id: formData.project_id || undefined,
        task_id: formData.task_id || undefined,
        location: formData.location.trim() || undefined,
      });
    } else {
      addEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        project_id: formData.project_id || undefined,
        task_id: formData.task_id || undefined,
        location: formData.location.trim() || undefined,
      });
    }

    setIsEventModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este compromisso?')) {
      deleteEvent(id);
    }
  };

  // Date Navigation
  const handleNavigateDate = (days: number) => {
    setSelectedDate(addDaysToDateString(selectedDate, days));
  };

  // Filter tasks by selected project in form
  const availableTasks = formData.project_id
    ? allTasks.filter((t) => t.projectId === formData.project_id)
    : allTasks;

  // Event Type Badge Renderer
  const renderTypeBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'meeting':
        return (
          <Badge variant="info" icon={<Users className="w-3 h-3" />}>
            Reunião
          </Badge>
        );
      case 'focus':
        return (
          <Badge variant="purple" icon={<Target className="w-3 h-3" />}>
            Bloco de Foco
          </Badge>
        );
      case 'task':
        return (
          <Badge variant="warning" icon={<CheckSquare className="w-3 h-3" />}>
            Tarefa
          </Badge>
        );
      case 'project':
        return (
          <Badge variant="indigo" icon={<Briefcase className="w-3 h-3" />}>
            Projeto
          </Badge>
        );
      default:
        return <Badge variant="default">Outro</Badge>;
    }
  };

  // Get project name by ID
  const getProjectName = (projId?: string) => {
    if (!projId) return null;
    const p = allProjects.find((item) => item.id === projId);
    return p ? p.name : null;
  };

  // Helper to format date header title (e.g. "12 de Agosto de 2026")
  const formattedDateTitle = new Date(selectedDate + 'T12:00:00Z').toLocaleDateString(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate days for Week view
  const getWeekDays = (baseDateStr: string) => {
    const base = new Date(baseDateStr + 'T12:00:00Z');
    const dayOfWeek = base.getUTCDay(); // 0 is Sunday
    const sundayStr = addDaysToDateString(baseDateStr, -dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDaysToDateString(sundayStr, i));
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Calculate days for Month view (e.g., August 2026)
  const getMonthGrid = (baseDateStr: string) => {
    const [year, monthNumber] = baseDateStr.split('-').map(Number);
    const month = monthNumber - 1;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const grid = [];
    // Padding days before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }
    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push(dateStr);
    }
    return grid;
  };

  const monthGrid = getMonthGrid(selectedDate);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Agenda & Calendário Interno
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organização de trabalho, blocos de foco, carga diária e detecção de conflitos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Blocking Button */}
          <Button
            onClick={() => handleOpenCreateModal('focus')}
            variant="outline"
            className="border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            leftIcon={<Target className="w-4 h-4 text-purple-600" />}
          >
            Bloco de Foco
          </Button>

          {/* New Event Button */}
          <Button
            onClick={() => handleOpenCreateModal('meeting')}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Evento
          </Button>
        </div>
      </div>

      {/* CARGA DE HOJE & PAINEL DE METRICAS (PROMPT REQUIRED) */}
      <Card className="p-4 sm:p-5 bg-slate-900 text-white dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Painel de Carga de Trabalho
              </span>
              <span className="text-xs text-slate-400 font-medium">— {formattedDateTitle}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Ocupação Diária: {todayWorkload.occupancyRate}%
            </h3>
          </div>

          {/* Workday Hours Configurator */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium shrink-0">Jornada Padrão:</span>
            <select
              value={workdayHours}
              onChange={(e) => setWorkdayHours(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono font-bold"
            >
              <option value={4}>4 horas / dia</option>
              <option value={6}>6 horas / dia</option>
              <option value={8}>8 horas / dia (Padrão)</option>
              <option value={10}>10 horas / dia</option>
              <option value={12}>12 horas / dia</option>
            </select>
          </div>
        </div>

        {/* Workload Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Horas Agendadas</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1 block">
              {todayWorkload.scheduledHours}h
            </span>
            <span className="text-[10px] text-slate-400">{todayWorkload.scheduledMinutes} minutos acumulados</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Horas Disponíveis</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
              {todayWorkload.availableHours}h
            </span>
            <span className="text-[10px] text-slate-400">
              De {workdayHours}h configuradas
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Taxa de Ocupação</span>
            <span
              className={`text-xl font-extrabold mt-1 block ${
                todayWorkload.occupancyRate > 100
                  ? 'text-rose-400'
                  : todayWorkload.occupancyRate >= 80
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
            >
              {todayWorkload.occupancyRate}%
            </span>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  todayWorkload.occupancyRate > 100
                    ? 'bg-rose-500'
                    : todayWorkload.occupancyRate >= 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(todayWorkload.occupancyRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Conflitos de Horário</span>
            <span
              className={`text-xl font-extrabold mt-1 block ${
                todayWorkload.conflictCount > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {todayWorkload.conflictCount} {todayWorkload.conflictCount === 1 ? 'conflito' : 'conflitos'}
            </span>
            <span className="text-[10px] text-slate-400">
              {todayWorkload.conflictCount > 0 ? 'Horários sobrepostos' : 'Grade sem sobreposição'}
            </span>
          </div>
        </div>

        {/* CONFLICT WARNING BANNER */}
        {todayWorkload.conflictCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong className="font-bold">Atenção: Detectado conflito de horário no dia selecionado!</strong>
                <p className="text-[11px] text-rose-300">
                  Existem compromissos com horários concorrentes (eventoA.start &lt; eventoB.end e eventoA.end &gt; eventoB.start).
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('today')}
              className="border-rose-700 text-rose-200 hover:bg-rose-900 shrink-0 text-xs"
            >
              Ver Grade do Dia
            </Button>
          </div>
        )}
      </Card>

      {/* VIEW NAVIGATION TABS (Hoje, Semana, Mês, Integrações) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Hoje / Dia
          </button>

          <button
            onClick={() => setActiveTab('week')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'week'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semana
          </button>

          <button
            onClick={() => setActiveTab('month')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'month'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Mês
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Integrações Extensíveis
          </button>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-36 text-xs py-1.5"
          />
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(getBrasiliaDateString())}>
            Hoje
          </Button>
          <button
            onClick={() => handleNavigateDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavigateDate(1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: VISUALIZAÇÃO DIA (HOJE) */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Agenda / Hour Grid */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Cronograma de Horários — {formattedDateTitle}
                  </CardTitle>
                  <CardDescription>
                    Grade horária com alocação dos compromissos e indicação visual de sobreposições
                  </CardDescription>
                </div>

                <Badge variant={todayWorkload.conflictCount > 0 ? 'danger' : 'success'}>
                  {todayWorkload.conflictCount > 0 ? '⚠️ Com Conflitos' : '✓ Agenda Regular'}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {events.filter((e) => e.date === selectedDate).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold">Nenhum evento agendado para esta data.</p>
                    <Button variant="outline" size="sm" onClick={() => handleOpenCreateModal('meeting')}>
                      Agendar Primeiro Compromisso
                    </Button>
                  </div>
                ) : (
                  events
                    .filter((e) => e.date === selectedDate)
                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                    .map((evt) => {
                      const conflicts = conflictMap.get(evt.id) || [];
                      const hasConflict = conflicts.length > 0;
                      const projName = getProjectName(evt.project_id);

                      return (
                        <div
                          key={evt.id}
                          className={`p-4 rounded-xl border transition-all ${
                            hasConflict
                              ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {renderTypeBadge(evt.type)}
                                {hasConflict && (
                                  <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>
                                    Conflito de Horário ({conflicts.length})
                                  </Badge>
                                )}
                                <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  {evt.startTime} - {evt.endTime}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{evt.title}</h4>

                              {evt.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {evt.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                                {projName && (
                                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {projName}
                                  </span>
                                )}

                                {evt.location && (
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {evt.location}
                                  </span>
                                )}
                              </div>

                              {/* Overlap detail notice */}
                              {hasConflict && (
                                <div className="mt-2 p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-900 dark:text-rose-200">
                                  <strong className="font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Sobrepõe com:
                                  </strong>
                                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                                    {conflicts.map((c) => (
                                      <li key={c.id}>
                                        <span className="font-semibold">{c.title}</span> ({c.startTime} - {c.endTime})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(evt)}>
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(evt.id)}>
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Quick Time Blocking & Day Summary */}
          <div className="space-y-4">
            <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
                  <Target className="w-4 h-4 text-purple-600" />
                  Time Blocking (Bloco de Foco)
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  Bloqueie um período do seu dia para focar sem reuniões em tarefas críticas ou projetos prioritários.
                </p>
                <Button
                  onClick={() => handleOpenCreateModal('focus')}
                  variant="primary"
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Criar Bloco de Foco
                </Button>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Resumo dos Eventos do Dia
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total de Eventos:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {events.filter((e) => e.date === selectedDate).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Reuniões:</span>
                  <span className="font-bold text-sky-600">
                    {events.filter((e) => e.date === selectedDate && e.type === 'meeting').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Blocos de Foco:</span>
                  <span className="font-bold text-purple-600">
                    {events.filter((e) => e.date === selectedDate && e.type === 'focus').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Vínculos com Projeto:</span>
                  <span className="font-bold text-indigo-600">
                    {events.filter((e) => e.date === selectedDate && e.project_id).length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: VISUALIZAÇÃO SEMANA */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Visão Semanal de Carga & Compromissos
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhamento de 7 dias com taxa de ocupação e detecção de sobreposição.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((dayStr) => {
              const dayWorkload = getWorkloadForDate(dayStr);
              const dayEvents = events.filter((e) => e.date === dayStr);
              const isSelected = dayStr === selectedDate;
              const d = new Date(dayStr + 'T12:00:00Z');
              const dayName = d.toLocaleDateString(BRAZIL_LOCALE, { timeZone: BRAZIL_TIME_ZONE, weekday: 'short' });

              return (
                <div
                  key={dayStr}
                  onClick={() => setSelectedDate(dayStr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">{dayName}</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                          {formatDate(dayStr)}
                        </span>
                      </div>
                      <Badge variant={dayWorkload.conflictCount > 0 ? 'danger' : 'default'} size="sm">
                        {dayWorkload.occupancyRate}%
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      {dayEvents.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Sem eventos</p>
                      ) : (
                        dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-800 dark:text-slate-200 truncate"
                          >
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-1">
                              {evt.startTime}
                            </span>
                            {evt.title}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
                    <span>{dayWorkload.scheduledHours}h de {workdayHours}h</span>
                    {dayWorkload.conflictCount > 0 && <span className="text-rose-500 font-bold">⚠️ Conflito</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VISUALIZAÇÃO MÊS */}
      {activeTab === 'month' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Visão Mensal de Ocupação</h3>
              <p className="text-xs text-slate-500">Clique em qualquer dia para inspecionar os eventos na grade.</p>
            </div>
            <Badge variant="indigo">{formattedDateTitle}</Badge>
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="font-bold text-slate-400 text-[11px] py-1">
                {day}
              </div>
            ))}

            {monthGrid.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg" />;
              }

              const dayWorkload = getWorkloadForDate(dateStr);
              const isSelected = dateStr === selectedDate;
              const dayNum = parseInt(dateStr.split('-')[2], 10);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setActiveTab('today');
                  }}
                  className={`h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{dayNum}</span>
                    {dayWorkload.scheduledHours > 0 && (
                      <span className="text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {dayWorkload.scheduledHours}h
                      </span>
                    )}
                  </div>

                  {dayWorkload.conflictCount > 0 ? (
                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-1 py-0.5 rounded truncate">
                      ⚠️ Conflito
                    </span>
                  ) : dayWorkload.scheduledHours > 0 ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          dayWorkload.occupancyRate > 100
                            ? 'bg-rose-500'
                            : dayWorkload.occupancyRate >= 80
                            ? 'bg-amber-400'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(dayWorkload.occupancyRate, 100)}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 4: INTEGRAÇÕES COM CALENDÁRIOS EXTERNOS (PROMPT REQUIRED) */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                Integrações com Calendários Externos (Google Calendar & Outlook)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Relatório de governança de segurança para sincronização bidirecional em ambientes de hospedagem estática (GitHub Pages).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {adapters.map((adapter) => (
                <Card
                  key={adapter.id}
                  className="p-5 border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {adapter.name}
                        </span>
                        <Badge variant="danger" className="text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                          BLOQUEADO
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Provedor: {adapter.provider}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-extrabold text-xs text-indigo-600">
                      {adapter.provider.charAt(0)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{adapter.description}</p>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                    <strong className="font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-3.5 h-3.5" /> Motivo do Bloqueio de Segurança:
                    </strong>
                    <p className="leading-tight opacity-90">{adapter.securityNotice}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-rose-600 font-bold">Ação: Requer Edge Function</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdapterId(adapter.id);
                        setIsAdapterModalOpen(true);
                      }}
                      className="text-xs border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50"
                    >
                      Ver Arquitetura Segura Propasta
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL DE ADAPTER / INTEGRAÇÃO (PROPOSTA SUPABASE EDGE FUNCTION) */}
      {isAdapterModalOpen && (() => {
        const selectedAdapter = adapters.find((a) => a.id === selectedAdapterId) || adapters[0];
        return (
          <Modal
            isOpen={isAdapterModalOpen}
            onClose={() => setIsAdapterModalOpen(false)}
            title={`Especificação de Segurança: ${selectedAdapter.name}`}
            description="Proposta Arquitetural para Supabase Edge Function & Vault RLS"
            footer={
              <Button variant="primary" onClick={() => setIsAdapterModalOpen(false)}>
                Fechar Especificação
              </Button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-900 dark:text-rose-200 flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Status: BLOQUEADO ATÉ CONFIGURAÇÃO SEGURA</strong>
                  O HubTask é hospedado no GitHub Pages (frontend estático). Para realizar sincronização OAuth 2.0 bidirecional com Google Calendar sem expor o <code className="font-mono bg-rose-100 dark:bg-rose-900 px-1 rounded">client_secret</code> nem os <code className="font-mono bg-rose-100 dark:bg-rose-900 px-1 rounded">refresh_tokens</code> no navegador do cliente, é obrigatório um backend seguro.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
                  Arquitetura Propasta com Supabase Edge Functions:
                </h4>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                      1. Endpoint OAuth Auth Token Exchange
                    </span>
                    <code className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-200 dark:bg-slate-900 p-1 rounded">
                      {selectedAdapter.proposedArchitecture?.edgeFunctionAuth}
                    </code>
                    <p className="text-slate-500">
                      Recebe o <code className="font-mono">authorization_code</code> do frontend e faz a troca segura com a API do Google server-side, retornando apenas um token de sessão anônimo para o navegador.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                      2. Endpoint de Sincronização Bidirecional & Webhooks
                    </span>
                    <code className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-200 dark:bg-slate-900 p-1 rounded">
                      {selectedAdapter.proposedArchitecture?.edgeFunctionSync}
                    </code>
                    <p className="text-slate-500">
                      Processa alterações de <code className="font-mono">calendar_events</code> no HubTask para o Google Calendar e escuta notificações do Google para importar/atualizar compromissos no HubTask.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                      3. Armazenamento Criptografado no Supabase DB
                    </span>
                    <code className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-200 dark:bg-slate-900 p-1 rounded">
                      {selectedAdapter.proposedArchitecture?.databaseTable}
                    </code>
                    <p className="text-slate-500">
                      Persiste os refresh tokens criptografados com criptografia pgcrypto e proteção Row Level Security (RLS) vinculada ao UID do usuário logado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Escopos Requeridos para Google Calendar:
                </span>
                <ul className="list-disc list-inside font-mono text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  {selectedAdapter.proposedArchitecture?.requiredScopes.map((scope) => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* MODAL DE CRIAÇÃO E EDIÇÃO DE EVENTOS */}
      {isEventModalOpen && (
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title={editingEvent ? 'Editar Compromisso' : formData.type === 'focus' ? 'Criar Bloco de Foco (Time Blocking)' : 'Agendar Novo Evento'}
          description="Preencha os detalhes e horário do evento"
          footer={
            <div className="flex items-center justify-between w-full">
              {editingEvent ? (
                <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => {
                  deleteEvent(editingEvent.id);
                  setIsEventModalOpen(false);
                }}>
                  Excluir
                </Button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSaveEvent}>
                  {editingEvent ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
            {/* Title */}
            <Input
              label="Título do Compromisso *"
              placeholder="Ex: Reunião de alinhamento ou Bloco de Foco em Dev"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {/* Event Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Tipo de Evento *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
                options={[
                  { value: 'meeting', label: 'Reunião (meeting)' },
                  { value: 'focus', label: 'Bloco de Foco (focus - Time Blocking)' },
                  { value: 'task', label: 'Tarefa (task)' },
                  { value: 'project', label: 'Projeto (project)' },
                  { value: 'other', label: 'Outro (other)' },
                ]}
              />

              <Input
                label="Data *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Start & End Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Horário Inicial *"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />

              <Input
                label="Horário Final *"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            {/* Vínculo com Projeto */}
            <Select
              label="Vínculo com Projeto (Opcional - project_id)"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value, task_id: '' })}
              options={[
                { value: '', label: 'Nenhum projeto vinculado' },
                ...allProjects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
              ]}
            />

            {/* Vínculo com Tarefa */}
            {availableTasks.length > 0 && (
              <Select
                label="Vínculo com Tarefa (Opcional - task_id)"
                value={formData.task_id}
                onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                options={[
                  { value: '', label: 'Nenhuma tarefa vinculada' },
                  ...availableTasks.map((t) => ({ value: t.id, label: `${t.code} - ${t.title}` })),
                ]}
              />
            )}

            {/* Location */}
            <Input
              label="Local / Link da Reunião"
              placeholder="Ex: Sala Virtual, Google Meet ou Sede Físico"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            {/* Description */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Descrição / Pauta
              </label>
              <textarea
                rows={3}
                placeholder="Detalhes sobre o objetivo do compromisso ou bloco de foco..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
