import React, { useState } from 'react';
import { formatDate, formatTime } from '../lib/utils';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  FolderPlus,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  User,
  SlidersHorizontal,
  ChevronRight,
  Send,
  FileCheck2,
  ListFilter,
  Check,
  X,
  Building2,
  Tv,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useDemands } from '../hooks/useDemands';
import { Demand, DemandStatus, Priority } from '../types';
import { calculatePriorityFromScore } from '../services/demandsService';

export const Demands: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenNewDemandModal } = useOutletContext<{ onOpenNewDemandModal: () => void }>();
  const {
    demands,
    metrics,
    rules,
    updateDemandStatus,
    addComment,
    assignDemand,
    convertDemandToProject,
    calculateSLA,
  } = useDemands();

  const [activeTab, setActiveTab] = useState<'all' | 'approval_queue' | 'rules'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Selected Demand Modal for Triagem / Approval
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [reassignName, setReassignName] = useState('');

  const handleOpenDemandModal = (demand: Demand) => {
    setSelectedDemand(demand);
    setReassignName(demand.assignee || 'Carlos Eduardo');
  };

  const handleStatusChange = (status: DemandStatus, defaultComment?: string) => {
    if (!selectedDemand) return;
    const updated = updateDemandStatus(
      selectedDemand.id,
      status,
      defaultComment || newCommentText,
      'Jonathan Müller (Gestor)'
    );
    if (updated) {
      setSelectedDemand(updated);
      setNewCommentText('');
    }
  };

  const handleAddComment = () => {
    if (!selectedDemand || !newCommentText.trim()) return;
    const updated = addComment(selectedDemand.id, 'Jonathan Müller', newCommentText.trim());
    if (updated) {
      setSelectedDemand(updated);
      setNewCommentText('');
    }
  };

  const handleReassign = (newAssignee: string) => {
    if (!selectedDemand) return;
    setReassignName(newAssignee);
    const updated = assignDemand(selectedDemand.id, newAssignee);
    if (updated) {
      setSelectedDemand(updated);
    }
  };

  const handleConvert = (demandId: string) => {
    const res = convertDemandToProject(demandId, 'Jonathan Müller');
    if (res) {
      alert(`Demanda convertida com sucesso no Projeto ${res.project.code} (${res.project.name})!`);
      setSelectedDemand(res.demand);
    }
  };

  // Filter logic
  const filteredDemands = demands.filter((demand) => {
    const matchesSearch =
      demand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || demand.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || demand.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const approvalQueueDemands = demands.filter(
    (d) => d.status === 'waiting_approval' || d.status === 'new' || d.status === 'triage'
  );

  const getStatusBadge = (status: DemandStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="purple">Nova / Fila</Badge>;
      case 'triage':
        return <Badge variant="info">Em Triagem</Badge>;
      case 'waiting_approval':
        return <Badge variant="warning">Aguardando Aprovação</Badge>;
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejeitada</Badge>;
      case 'converted':
        return <Badge variant="indigo">Convertida em Projeto</Badge>;
      case 'in_progress':
        return <Badge variant="info">Em Andamento</Badge>;
      case 'completed':
        return <Badge variant="success">Concluída</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (score: number, priority: Priority) => {
    const { label } = calculatePriorityFromScore(score || 1);
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">Crítica ({score} pts)</Badge>;
      case 'high':
        return <Badge variant="warning">Alta ({score} pts)</Badge>;
      case 'medium':
        return <Badge variant="info">Média ({score} pts)</Badge>;
      default:
        return <Badge variant="default">Baixa ({score} pts)</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Triagem & Gestão de Demandas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fluxo completo do pedido até aprovação e conversão em projeto
          </p>
        </div>

        <Button onClick={onOpenNewDemandModal} variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Nova Demanda
        </Button>
      </div>

      {/* SLA & METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Demandas Abertas</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.openDemandsCount}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Em triagem e aprovação</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SLA Médio de Resposta</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
              {metrics.avgSLAFormatted}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Até 1ª triagem do gestor</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Taxa de Conversão</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.conversionRate}%
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">{metrics.convertedCount} convertidas em projeto</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Regras de Atribuição</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {rules.length}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">Categorias mapeadas</p>
          </div>
        </Card>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-brand-accent text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          Todas as Demandas ({demands.length})
        </button>

        <button
          onClick={() => setActiveTab('approval_queue')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'approval_queue'
              ? 'bg-brand-accent text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Fila de Triagem & Aprovação
          {approvalQueueDemands.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-extrabold">
              {approvalQueueDemands.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-brand-accent text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Regras de Atribuição ({rules.length})
        </button>
      </div>

      {/* TAB 1: TODAS AS DEMANDAS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Buscar por código, título ou participante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os Status' },
                  { value: 'new', label: 'Nova / Fila' },
                  { value: 'triage', label: 'Em Triagem' },
                  { value: 'waiting_approval', label: 'Aguardando Aprovação' },
                  { value: 'approved', label: 'Aprovada' },
                  { value: 'rejected', label: 'Rejeitada' },
                  { value: 'converted', label: 'Convertida em Projeto' },
                ]}
              />

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas as Categorias' },
                  { value: 'Tecnologia', label: 'Tecnologia' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Administrativo', label: 'Administrativo' },
                  { value: 'Financeiro', label: 'Financeiro' },
                  { value: 'Operacional', label: 'Operacional' },
                  { value: 'Outro', label: 'Outro' },
                ]}
              />

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas as Prioridades' },
                  { value: 'critical', label: 'Crítica' },
                  { value: 'high', label: 'Alta' },
                  { value: 'medium', label: 'Média' },
                  { value: 'low', label: 'Baixa' },
                ]}
              />
            </div>
          </Card>

          {/* Table */}
          {filteredDemands.length === 0 ? (
            <EmptyState
              title="Nenhuma demanda encontrada"
              description="Não encontramos demandas correspondentes aos filtros aplicados."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              }
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="p-4">Código / Demanda</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Score / Prioridade</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Atribuído a</th>
                      <th className="p-4">SLA 1ª Resposta</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredDemands.map((demand) => {
                      const sla = calculateSLA(demand);

                      return (
                        <tr
                          key={demand.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => handleOpenDemandModal(demand)}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {demand.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                {demand.code}
                              </span>
                              {demand.system_affected && (
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded font-medium">
                                  Sis: {demand.system_affected}
                                </span>
                              )}
                              {demand.channel && (
                                <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.2 rounded font-medium">
                                  Canal: {demand.channel}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                            {demand.category}
                          </td>

                          <td className="p-4">
                            {getPriorityBadge(demand.priority_score, demand.priority)}
                          </td>

                          <td className="p-4">{getStatusBadge(demand.status)}</td>

                          <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                            {demand.assignee || 'Aguardando Gestor'}
                          </td>

                          <td className="p-4">
                            {sla ? (
                              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                                {sla.formatted}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-semibold">
                                Pendente Triagem
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDemandModal(demand);
                              }}
                            >
                              Gerenciar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: FILA DE TRIAGEM & APROVAÇÃO */}
      {activeTab === 'approval_queue' && (
        <div className="space-y-4">
          <Card className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold block">Fila Direta do Gestor</strong>
                Abaixo estão listadas as demandas aguardando análise técnica, priorização ou deliberação final de aprovação.
              </div>
            </div>
          </Card>

          {approvalQueueDemands.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold">Fila de aprovação zerada!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Não há nenhuma demanda pendente de triagem ou deliberação de gestor no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvalQueueDemands.map((demand) => {
                const sla = calculateSLA(demand);

                return (
                  <Card key={demand.id} className="p-5 space-y-4 hover:border-indigo-400 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{demand.code}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {demand.category}
                          </span>
                          {getStatusBadge(demand.status)}
                          {getPriorityBadge(demand.priority_score, demand.priority)}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{demand.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDemand(demand);
                            handleStatusChange('approved', 'Aprovado via fila rápida do gestor.');
                          }}
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Aprovar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDemand(demand);
                            handleStatusChange('rejected', 'Rejeitado via fila rápida do gestor.');
                          }}
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" /> Rejeitar
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenDemandModal(demand)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {demand.description}
                    </p>

                    {/* Conditional details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Solicitante</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{demand.requester}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Atribuído por Regra</span>
                        <span className="font-medium text-indigo-600">{demand.assignee}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Data Desejada</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(demand.dueDate)}</span>
                      </div>
                    </div>

                    {demand.justification && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
                        <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Justificativa de Alto Impacto
                        </span>
                        <p className="text-amber-800 dark:text-amber-300 italic">{demand.justification}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGRAS DE ATRIBUIÇÃO (assignment_rules) */}
      {activeTab === 'rules' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Regras de Atribuição Automática (assignment_rules)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ao cadastrar uma nova demanda, o sistema consulta estas regras com base na Categoria e preenche o campo <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 font-mono">assigned_to</code> automaticamente.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="p-3">ID da Regra</th>
                  <th className="p-3">Categoria Mapeada</th>
                  <th className="p-3">Responsável Automático (assigned_to)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-400">{rule.id}</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{rule.category}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{rule.assignee}</td>
                    <td className="p-3">
                      <Badge variant="success">Ativa</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL DE TRIAGEM, APROVAÇÃO E CONVERSÃO DA DEMANDA */}
      {selectedDemand && (
        <Modal
          isOpen={!!selectedDemand}
          onClose={() => setSelectedDemand(null)}
          title={`Triagem da Demanda - ${selectedDemand.code}`}
          description={selectedDemand.title}
          footer={
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <Button variant="ghost" onClick={() => setSelectedDemand(null)}>
                Fechar
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Botão de Conversão em Projeto */}
                {selectedDemand.status === 'approved' && !selectedDemand.projectId && (
                  <Button
                    variant="primary"
                    onClick={() => handleConvert(selectedDemand.id)}
                    leftIcon={<FolderPlus className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Converter em Projeto
                  </Button>
                )}

                {selectedDemand.projectId && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/projects/${selectedDemand.projectId}`)}
                    leftIcon={<ArrowRight className="w-4 h-4 text-indigo-600" />}
                  >
                    Ver Projeto Criado
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Status & Priority Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Atual</span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedDemand.status)}
                  {getPriorityBadge(selectedDemand.priority_score, selectedDemand.priority)}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">SLA 1ª Resposta</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {calculateSLA(selectedDemand)?.formatted || 'Pendente de Ação'}
                </span>
              </div>
            </div>

            {/* Descrição e Detalhes */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Descrição da Solicitação</h4>
              <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedDemand.description}
              </p>
            </div>

            {/* Campos Condicionais */}
            {(selectedDemand.system_affected || selectedDemand.channel || selectedDemand.justification) && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Campos Específicos Preenchidos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDemand.system_affected && (
                    <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-[11px]">
                        Sistema Afetado
                      </span>
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">{selectedDemand.system_affected}</span>
                    </div>
                  )}

                  {selectedDemand.channel && (
                    <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block text-[11px]">
                        Canal (Marketing)
                      </span>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">{selectedDemand.channel}</span>
                    </div>
                  )}
                </div>

                {selectedDemand.justification && (
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Justificativa de Alto Impacto
                    </span>
                    <p className="text-amber-800 dark:text-amber-300 italic">{selectedDemand.justification}</p>
                  </div>
                )}
              </div>
            )}

            {/* Atribuição & Responsável */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" /> Responsável (assigned_to)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Solicitado por: {selectedDemand.requester}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Select
                    value={reassignName}
                    onChange={(e) => handleReassign(e.target.value)}
                    options={[
                      { value: 'Carlos Eduardo', label: 'Carlos Eduardo (Tech Lead)' },
                      { value: 'Ana Beatriz', label: 'Ana Beatriz (Product Designer)' },
                      { value: 'Mariana Souza', label: 'Mariana Souza (Marketing)' },
                      { value: 'Lucas Silveira', label: 'Lucas Silveira (Full Stack)' },
                      { value: 'Fernanda Lima', label: 'Fernanda Lima (Financeiro)' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Painel de Ações do Gestor */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Alterar Status na Fila</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('triage', 'Iniciando análise de triagem.')}
                  className={selectedDemand.status === 'triage' ? 'border-sky-500 bg-sky-50 text-sky-700' : ''}
                >
                  Colocar em Triagem
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('waiting_approval', 'Encaminhado para aprovação do gestor.')}
                  className={selectedDemand.status === 'waiting_approval' ? 'border-amber-500 bg-amber-50 text-amber-700' : ''}
                >
                  Pedir Aprovação
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('approved', 'Demanda aprovada com sucesso.')}
                  className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Aprovar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('rejected', 'Demanda indeferida.')}
                  className="border-rose-500 text-rose-700 hover:bg-rose-50"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" /> Rejeitar
                </Button>
              </div>
            </div>

            {/* Comentários / Fila de Interação */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-500" /> Comentários & Histórico
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(!selectedDemand.comments || selectedDemand.comments.length === 0) ? (
                  <p className="text-slate-400 italic text-[11px]">Nenhum comentário registrado ainda.</p>
                ) : (
                  selectedDemand.comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.author}</span>
                        <span>{formatTime(c.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px]">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Escreva um comentário ou parecer técnico..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <Button variant="primary" size="sm" onClick={handleAddComment}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
