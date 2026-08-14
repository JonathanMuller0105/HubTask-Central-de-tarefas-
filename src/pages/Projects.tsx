import React, { useState } from 'react';
import { formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Shield,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Edit,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  CheckCircle2,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Project, ProjectStatus, ProjectPriority } from '../types';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const {
    projects,
    loading,
    isManager,
    role,
    createProject,
    updateProject,
    deleteProject,
    isProjectOverdue,
    isProjectAtRisk,
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (loading) {
    return <LoadingState message="Carregando projetos..." />;
  }

  // Filtering
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
    const matchesDept = departmentFilter === 'all' || p.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

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
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: ProjectPriority) => {
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Projetos Estratégicos
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isManager
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isManager ? 'Visão Gestor (Todos)' : 'Visão Membro (Meus Projetos)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerenciamento consolidado, acompanhamento de prazos, baselines e entregáveis.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Criar Projeto
        </Button>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, código, descrição ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-brand-accent focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo (Em Andamento)</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Departamentos</option>
              <option value="Engenharia de Software">Engenharia</option>
              <option value="Recursos Humanos">RH</option>
              <option value="Marketing & Design">Marketing</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="Segurança & Conformidade">Segurança</option>
            </select>

            {/* Alternador de Visão Grid / Tabela */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-brand-accent dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visão em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-brand-accent dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visão em Tabela"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Conteúdo de Projetos */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Não encontramos nenhum projeto que corresponda aos filtros aplicados."
          actionText="Limpar Filtros"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setDepartmentFilter('all');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const overdue = isProjectOverdue(project);
            const atRisk = isProjectAtRisk(project);

            return (
              <Card
                key={project.id}
                className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 group"
              >
                <div className="space-y-3">
                  {/* Code, Badges, Alert */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {project.code}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(project.status)}
                      {getPriorityBadge(project.priority)}
                      {overdue && <Badge variant="danger">Atrasado</Badge>}
                      {atRisk && !overdue && <Badge variant="warning">Em Risco</Badge>}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{project.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {project.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Progresso</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} size="md" showPercentage={false} />
                  </div>

                  {/* Info Meta Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-400">Responsável</span>
                      <strong className="text-slate-800 dark:text-slate-200">{project.assignee}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Prazo</span>
                      <strong className={overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                        {formatDate(project.endDate)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    Ver Detalhes
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar Projeto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o projeto "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Excluir Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Código & Nome</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Prazo</th>
                  <th className="px-4 py-3">Progresso</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((project) => {
                  const overdue = isProjectOverdue(project);
                  const atRisk = isProjectAtRisk(project);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            {project.code}
                          </span>
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left cursor-pointer"
                          >
                            {project.name}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {project.department}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getStatusBadge(project.status)}
                          {overdue && <Badge variant="danger">Atrasado</Badge>}
                          {atRisk && !overdue && <Badge variant="warning">Em Risco</Badge>}
                        </div>
                      </td>

                      <td className="px-4 py-3">{getPriorityBadge(project.priority)}</td>

                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {project.assignee}
                      </td>

                      <td className="px-4 py-3">
                        <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {formatDate(project.endDate)}
                        </span>
                      </td>

                      <td className="px-4 py-3 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Progress value={project.progress} size="sm" showPercentage={false} />
                          </div>
                          <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                            {project.progress}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            Detalhes
                          </Button>
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir ${project.name}?`)) {
                                deleteProject(project.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Criar / Editar Projeto */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={(projectData) => {
          if (editingProject) {
            updateProject(editingProject.id, projectData);
          } else {
            createProject(projectData);
          }
        }}
        initialData={editingProject}
      />
    </div>
  );
};
