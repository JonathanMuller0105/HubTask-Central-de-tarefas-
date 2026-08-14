import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Folder,
  Calendar,
  Clock,
  User,
  Shield,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Paperclip,
  Check,
  Edit,
  Trash2,
  Filter,
  Search,
  Eye,
  LockKeyhole,
  Upload,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { GanttChart } from '../components/projects/GanttChart';
import { ProjectFile, Task, TaskStatus, TaskPriority, ProjectStatus } from '../types';
import { formatDate } from '../lib/utils';
import { useWorkspacePreferences } from '../hooks/useWorkspacePreferences';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useWorkspacePreferences();
  const currentUploader = profile.name;
  const {
    projects,
    getProjectById,
    getTasks,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    getDependencies,
    addDependency,
    deleteDependency,
    getFiles,
    addFile,
    deleteFile,
    isProjectOverdue,
    isProjectAtRisk,
    isTaskOverdue,
  } = useProjects();

  const project = id ? getProjectById(id) : undefined;
  const projectTasks = id ? getTasks(id) : [];
  const projectFiles = id ? getFiles(id) : [];
  const projectDependencies = id ? getDependencies(id) : [];

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline' | 'files'>('overview');

  // Modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters for Tasks tab
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');

  // New File modal/input
  const [selectedUpload, setSelectedUpload] = useState<File | null>(null);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          title="Projeto Não Encontrado"
          description="O projeto solicitado não existe ou você não possui permissão de acesso."
          actionText="Voltar para Projetos"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const isOverdue = isProjectOverdue(project);
  const isAtRisk = isProjectAtRisk(project);

  // Helper formatting badges
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Em Andamento</Badge>;
      case 'planning':
        return <Badge variant="info">Em Planejamento</Badge>;
      case 'paused':
        return <Badge variant="warning">Pausado</Badge>;
      case 'completed':
        return <Badge variant="indigo">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <Badge variant="neutral">A Fazer</Badge>;
      case 'in_progress':
        return <Badge variant="info">Em Andamento</Badge>;
      case 'blocked':
        return <Badge variant="danger">Bloqueado</Badge>;
      case 'done':
        return <Badge variant="success">Concluído</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">Crítica</Badge>;
      case 'high':
        return <Badge variant="warning">Alta</Badge>;
      case 'medium':
        return <Badge variant="info">Média</Badge>;
      case 'low':
        return <Badge variant="neutral">Baixa</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  // Filter tasks
  const filteredTasks = projectTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.assignee.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    const matchesPriority = taskPriorityFilter === 'all' || t.priority === taskPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completedTasksCount = projectTasks.filter((t) => t.status === 'done').length;
  const inProgressTasksCount = projectTasks.filter((t) => t.status === 'in_progress').length;
  const blockedTasksCount = projectTasks.filter((t) => t.status === 'blocked').length;
  const overdueTasksCount = projectTasks.filter((t) => isTaskOverdue(t)).length;

  const filteredFiles = projectFiles.filter((file) => {
    const query = fileSearch.trim().toLocaleLowerCase('pt-BR');
    return !query || [file.name, file.type, file.uploadedBy].some((value) => value.toLocaleLowerCase('pt-BR').includes(query));
  });

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpload) return;
    if (selectedUpload.size > 2 * 1024 * 1024) {
      alert('Para visualização local, escolha um arquivo de até 2 MB.');
      return;
    }
    const contentUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(selectedUpload);
    });
    const size = selectedUpload.size < 1024 * 1024
      ? `${Math.max(1, Math.round(selectedUpload.size / 1024))} KB`
      : `${(selectedUpload.size / 1024 / 1024).toFixed(1)} MB`;
    addFile(project.id, selectedUpload.name, currentUploader, contentUrl, selectedUpload.type, size);
    setSelectedUpload(null);
    setIsAddingFile(false);
  };

  const handleDeleteFile = (file: ProjectFile) => {
    if (file.uploadedBy.trim().toLocaleLowerCase('pt-BR') !== currentUploader.trim().toLocaleLowerCase('pt-BR')) return;
    if (confirm(`Excluir o arquivo "${file.name}"?`)) deleteFile(file.id, currentUploader);
  };

  const handleDeleteProject = () => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação removerá também as tarefas associadas.`)) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Voltar, Título, Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-0.5 cursor-pointer"
            title="Voltar para Projetos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {project.code}
              </span>
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
              {isOverdue && <Badge variant="danger">Atrasado</Badge>}
              {isAtRisk && !isOverdue && <Badge variant="warning">Em Risco</Badge>}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Departamento: <span className="font-medium text-slate-700 dark:text-slate-300">{project.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditProjectOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" /> Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteProject}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </Button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Folder className="w-4 h-4" /> Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Tarefas ({projectTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Cronograma
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'files'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Paperclip className="w-4 h-4" /> Arquivos ({projectFiles.length})
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Progresso e Alertas */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Progresso Geral do Projeto
                </h3>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {project.progress}%
                </span>
              </div>

              <Progress value={project.progress} size="lg" showPercentage={false} />

              {(isOverdue || isAtRisk) && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    isOverdue
                      ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/50 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold">
                      {isOverdue ? 'Atenção: Projeto Atrasado' : 'Atenção: Projeto em Situação de Risco'}
                    </p>
                    <p className="opacity-90">
                      {isOverdue
                        ? `O prazo previsto de entrega (${project.endDate}) expirou. Ajuste as metas ou adicione mais recursos.`
                        : `O ritmo de conclusão das tarefas está abaixo da média esperada para a data limite de ${project.endDate}.`}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Descrição do Projeto */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Descrição e Escopo
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description || 'Nenhuma descrição detalhada cadastrada para este projeto.'}
              </p>
            </Card>

            {/* Métricas e Tarefas Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3 text-center">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {projectTasks.length}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Tarefas</p>
              </Card>

              <Card className="p-3 text-center">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {completedTasksCount}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Concluídas</p>
              </Card>

              <Card className="p-3 text-center">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {inProgressTasksCount}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Em Andamento</p>
              </Card>

              <Card className="p-3 text-center">
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {overdueTasksCount}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Atrasadas</p>
              </Card>
            </div>
          </div>

          {/* Coluna Lateral: Pessoas, Datas e Informações de Governança */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Responsáveis & Equipe
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Responsável Tático</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {project.assignee || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Gestor / Manager</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {project.manager || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Marcos de Cronograma
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Data Inicial:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {project.startDate}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Prazo Previsto:
                  </span>
                  <span
                    className={`font-semibold ${
                      isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {project.endDate}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Baseline Oficial:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {project.baseline || project.endDate}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ABA 2: TAREFAS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Top Bar de Filtros e Botão Criar Tarefa */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar tarefas pelo título, código ou responsável..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="blocked">Bloqueado</option>
                <option value="done">Concluído</option>
              </select>

              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" /> Nova Tarefa
              </Button>
            </div>
          </div>

          {/* Lista de Tarefas */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Nenhuma tarefa encontrada"
              description="Não foram encontradas tarefas com os filtros selecionados ou ainda não há tarefas criadas."
              actionText="Criar Primeira Tarefa"
              onAction={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((t) => {
                const taskOverdue = isTaskOverdue(t);
                return (
                  <Card
                    key={t.id}
                    className="p-4 hover:shadow-md transition-shadow border-l-4"
                    style={{
                      borderLeftColor:
                        t.status === 'done'
                          ? '#10b981'
                          : t.status === 'blocked'
                          ? '#ef4444'
                          : t.status === 'in_progress'
                          ? '#6366f1'
                          : '#94a3b8',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t.code}
                          </span>
                          {getTaskStatusBadge(t.status)}
                          {getPriorityBadge(t.priority)}
                          {taskOverdue && <Badge variant="danger">Atrasada</Badge>}
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {t.title}
                        </h4>

                        {t.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                          <span>Responsável: <strong className="text-slate-700 dark:text-slate-300">{t.assignee}</strong></span>
                          <span>Prazo: <strong className={taskOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{t.dueDate}</strong></span>
                        </div>
                      </div>

                      {/* Progresso e Controles */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="w-28 sm:w-36 text-right">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                            <span>Progresso</span>
                            <span className="font-bold">{t.progress}%</span>
                          </div>
                          <Progress value={t.progress} size="sm" showPercentage={false} />
                        </div>

                        {/* Quick Status Setter */}
                        <div className="flex items-center gap-1">
                          {t.status !== 'done' && (
                            <button
                              onClick={() => updateTask(t.id, { status: 'done', progress: 100 })}
                              title="Marcar como Concluída"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            title="Editar Tarefa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Excluir tarefa "${t.title}"?`)) {
                                deleteTask(t.id);
                              }
                            }}
                            title="Excluir Tarefa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: CRONOGRAMA & GANTT */}
      {activeTab === 'timeline' && (
        <GanttChart
          project={project}
          tasks={projectTasks}
          dependencies={projectDependencies}
          onAddDependency={(predId, succId) => addDependency(project.id, predId, succId, 'FS')}
          onDeleteDependency={(depId) => deleteDependency(depId)}
        />
      )}

      {/* ABA 4: ARQUIVOS */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Documentos e Anexos do Projeto
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Repositório central de arquivos e entregáveis do projeto.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Buscar arquivo, tipo ou autor..."
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddingFile(!isAddingFile)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Anexar Arquivo
              </Button>
            </div>
          </div>

          {isAddingFile && (
            <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
              <form onSubmit={handleAddFile} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="file"
                  onChange={(e) => setSelectedUpload(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!selectedUpload} leftIcon={<Upload className="w-4 h-4" />}>
                  Anexar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingFile(false)}>
                  Cancelar
                </Button>
              </form>
            </Card>
          )}

          {projectFiles.length === 0 ? (
            <EmptyState
              title="Nenhum arquivo anexado"
              description="Ainda não foram adicionados documentos para este projeto."
              actionText="Anexar Primeiro Arquivo"
              onAction={() => setIsAddingFile(true)}
            />
          ) : filteredFiles.length === 0 ? (
            <EmptyState title="Nenhum arquivo encontrado" description={`Não encontramos resultados para “${fileSearch}”.`} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFiles.map((file) => {
                const canDelete = file.uploadedBy.trim().toLocaleLowerCase('pt-BR') === currentUploader.trim().toLocaleLowerCase('pt-BR');
                return (
                  <Card key={file.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {file.size} • Enviado por {file.uploadedBy} em {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Visualizar arquivo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file)}
                      disabled={!canDelete}
                      className={`p-1.5 rounded-lg transition-colors ${canDelete ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                      title={canDelete ? 'Excluir arquivo' : `Somente ${file.uploadedBy} pode excluir este arquivo`}
                    >
                      {canDelete ? <Trash2 className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                    </button>
                  </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name}
        description={previewFile ? `${previewFile.size} • Enviado por ${previewFile.uploadedBy} em ${formatDate(previewFile.uploadedAt)}` : undefined}
        maxWidth="2xl"
      >
        {previewFile && (
          <div className="min-h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
            {!previewFile.contentUrl ? (
              <div className="text-center p-8 max-w-md">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Arquivo vinculado ao projeto</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Este registro foi criado antes do armazenamento de conteúdo. Os metadados estão disponíveis, mas não existe uma cópia local para pré-visualização.</p>
              </div>
            ) : previewFile.mimeType?.startsWith('image/') ? (
              <img src={previewFile.contentUrl} alt={previewFile.name} className="max-h-[65vh] max-w-full object-contain" />
            ) : previewFile.mimeType === 'application/pdf' ? (
              <iframe src={previewFile.contentUrl} title={previewFile.name} className="w-full h-[65vh]" />
            ) : previewFile.mimeType?.startsWith('text/') ? (
              <iframe src={previewFile.contentUrl} title={previewFile.name} className="w-full h-[65vh] bg-white" />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Visualização não disponível para este formato.</p>
                <p className="text-xs text-slate-500 mt-2">O arquivo permanece vinculado e identificado no projeto.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Editar Projeto */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={(updatedData) => {
          updateProject(project.id, updatedData);
        }}
        initialData={project}
      />

      {/* Modal Criar / Editar Tarefa */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={(taskData) => {
          if (editingTask) {
            updateTask(editingTask.id, taskData);
          } else {
            createTask(taskData);
          }
        }}
        initialData={editingTask}
        projects={projects}
        defaultProjectId={project.id}
      />
    </div>
  );
};
