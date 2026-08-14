import React from 'react';
import { formatDate, getBrasiliaDateString } from '../lib/utils';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowUpRight,
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Shield,
  User as UserIcon,
  ChevronRight,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useProjects } from '../hooks/useProjects';
import { useDemands } from '../hooks/useDemands';
import { ProjectStatus } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenNewDemandModal } = useOutletContext<{ onOpenNewDemandModal?: () => void }>();
  const {
    projects,
    allProjects,
    tasks,
    allTasks,
    isManager,
    userName,
    isProjectOverdue,
    isProjectAtRisk,
    isTaskOverdue,
    updateTask,
  } = useProjects();
  const { metrics } = useDemands();

  const todayStr = getBrasiliaDateString();

  // 1. CARDS CALCULATIONS
  // Active Projects
  const activeProjects = projects.filter((p) => p.status === 'active');
  const activeProjectsCount = activeProjects.length;

  // Overdue Projects
  const overdueProjects = projects.filter((p) => isProjectOverdue(p));
  const overdueProjectsCount = overdueProjects.length;

  // At Risk Projects
  const atRiskProjects = projects.filter((p) => isProjectAtRisk(p));
  const atRiskProjectsCount = atRiskProjects.length;

  // Open Demands (Real metric from useDemands)
  const openDemandsCount = metrics.openDemandsCount;

  // On-time delivery rate
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const onTimeCompleted = completedProjects.filter((p) => p.endDate <= (p.baseline || p.endDate));
  const onTimeRate =
    completedProjects.length > 0
      ? Math.round((onTimeCompleted.length / completedProjects.length) * 100)
      : 100;

  // Average Progress
  const totalProgress = activeProjects.reduce((acc, p) => acc + p.progress, 0);
  const avgProgress =
    activeProjectsCount > 0 ? Math.round(totalProgress / activeProjectsCount) : 0;

  // 2. SECTIONS DATA
  // Meus Projetos (Projects assigned to user or where user is manager/assignee)
  const myProjects = isManager
    ? projects.slice(0, 4)
    : projects.filter(
        (p) =>
          p.assignee?.toLowerCase() === userName.toLowerCase() ||
          p.manager?.toLowerCase() === userName.toLowerCase()
      );

  // Próximas Entregas (Project or Task deadlines coming up, sorted by date)
  const upcomingDeliveries = [
    ...projects.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.name,
      type: 'project' as const,
      dueDate: p.endDate,
      assignee: p.assignee,
      status: p.status,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      type: 'task' as const,
      dueDate: t.dueDate,
      assignee: t.assignee,
      status: t.status,
    })),
  ]
    .filter((item) => item.status !== 'completed' && item.status !== 'done' && item.dueDate >= todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Tarefas Atrasadas
  const overdueTasksList = tasks
    .filter((t) => isTaskOverdue(t))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>;
      case 'planning':
        return <Badge variant="info">Planejamento</Badge>;
      case 'paused':
        return <Badge variant="warning">Pausado</Badge>;
      case 'completed':
        return <Badge variant="indigo">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelado</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Boas-Vindas e Alternador de Visão */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Painel HubTask
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                isManager
                  ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40'
                  : 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/40'
              }`}
            >
              {isManager ? (
                <>
                  <Shield className="w-3 h-3" /> Visão Gestor (Consolidada)
                </>
              ) : (
                <>
                  <UserIcon className="w-3 h-3" /> Visão Colaborador (Individual)
                </>
              )}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Olá, {userName}! Acompanhamento Geral.
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            {isManager
              ? `Acompanhando ${allProjects.length} projetos corporativos e ${allTasks.length} tarefas da equipe.`
              : `Exibindo somente os projetos e tarefas sob sua responsabilidade direta.`}
          </p>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          {onOpenNewDemandModal && (
            <Button
              onClick={onOpenNewDemandModal}
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Demanda
            </Button>
          )}
          <Link to="/projects">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              Gerenciar Projetos
            </Button>
          </Link>
        </div>

        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* CARDS DE KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Projetos Ativos */}
        <Card hoverable className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Projetos Ativos</span>
            <FolderKanban className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeProjectsCount}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Em andamento</p>
          </div>
        </Card>

        {/* 2. Projetos Atrasados */}
        <Card hoverable className="p-4 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Atrasados</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {overdueProjectsCount}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Fora do prazo</p>
          </div>
        </Card>

        {/* 3. Projetos Em Risco */}
        <Card hoverable className="p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Em Risco</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {atRiskProjectsCount}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Atenção requerida</p>
          </div>
        </Card>

        {/* 4. Demandas Abertas */}
        <Card hoverable className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Demandas Abertas</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {openDemandsCount}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Em triagem & aprovação</p>
          </div>
        </Card>

        {/* 5. SLA Médio */}
        <Card hoverable className="p-4 border-l-4 border-l-sky-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SLA 1ª Resposta</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
              {metrics.avgSLAFormatted}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Tempo até triagem</p>
          </div>
        </Card>

        {/* 6. Taxa de Conversão */}
        <Card hoverable className="p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Taxa Conversão</span>
            <FileCheck2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {metrics.conversionRate}%
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Demandas ➔ Projetos</p>
          </div>
        </Card>
      </div>

      {/* SEÇÃO 1: MEUS PROJETOS */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              {isManager ? 'Projetos sob Gestão' : 'Meus Projetos (Atribuídos)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhamento direto do status, responsabilidade e progresso
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Ver Todos os Projetos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
            Nenhum projeto vinculado encontrado para a visão atual.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {myProjects.map((p) => {
              const overdue = isProjectOverdue(p);
              const atRisk = isProjectAtRisk(p);

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-500">{p.code}</span>
                    {getStatusBadge(p.status)}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {p.name}
                  </h4>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Progresso</span>
                      <span className="font-bold text-indigo-600">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} size="sm" showPercentage={false} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>Prazo: <strong className={overdue ? 'text-rose-600' : ''}>{formatDate(p.endDate)}</strong></span>
                    <span className="font-semibold">{p.assignee}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* SEÇÃO 2 & SEÇÃO 3: PRÓXIMAS ENTREGAS E TAREFAS ATRASADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEÇÃO 2: PRÓXIMAS ENTREGAS */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-600" /> Próximas Entregas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prazos iminentes de projetos e tarefas organizados por data
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Próximos 30 dias</span>
          </div>

          {upcomingDeliveries.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhuma entrega agendada para os próximos dias.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingDeliveries.map((item) => (
                <div
                  key={`${item.type}_${item.id}`}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        item.type === 'project' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {item.type === 'project' ? 'Projeto' : 'Tarefa'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500">Atribuído a: {item.assignee}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block">{formatDate(item.dueDate)}</span>
                    <span className="text-[10px] text-slate-400">Prazo final</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* SEÇÃO 3: TAREFAS ATRASADAS */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Tarefas Atrasadas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atividades com prazo vencido necessitando de ação imediata
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
              {overdueTasksList.length}
            </span>
          </div>

          {overdueTasksList.length === 0 ? (
            <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold">Excelente! Não há tarefas atrasadas no momento.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueTasksList.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                        {t.code}
                      </span>
                      <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                        Venceu em: {formatDate(t.dueDate)}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-500">Responsável: {t.assignee}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTask(t.id, { status: 'done', progress: 100 })}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0 text-[11px] flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Concluir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
