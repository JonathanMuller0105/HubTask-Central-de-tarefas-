import { Demand, DemandStatus, Priority, AssignmentRule, DemandComment, Project } from '../types';
import { projectsService } from './projectsService';
import { getBrasiliaDateString } from '../lib/utils';

const DEMANDS_STORAGE_KEY = 'hubtask_demands';
const RULES_STORAGE_KEY = 'hubtask_assignment_rules';

export const defaultAssignmentRules: AssignmentRule[] = [
  { id: 'rule-1', category: 'Tecnologia', assignee: 'Carlos Eduardo' },
  { id: 'rule-2', category: 'Marketing', assignee: 'Ana Beatriz' },
  { id: 'rule-3', category: 'Administrativo', assignee: 'Fernanda Lima' },
  { id: 'rule-4', category: 'Financeiro', assignee: 'Fernanda Lima' },
  { id: 'rule-5', category: 'Operacional', assignee: 'Carlos Eduardo' },
];

export const initialDemands: Demand[] = [
  {
    id: 'dem-1042',
    code: 'DEM-1042',
    title: 'Migração do Servidor de Autenticação OAuth2',
    description: 'Atualizar os serviços legados para a nova infraestrutura de identidade com tokens JWT rotativos.',
    category: 'Tecnologia',
    system_affected: 'Sistema de Autenticação / SSO',
    urgency: 'high',
    impact: 'high',
    priority_score: 9,
    priority: 'high',
    justification: 'Impacta o login e segurança de mais de 200 colaboradores ativos.',
    status: 'waiting_approval',
    requester: 'Jonathan Müller',
    assignee: 'Carlos Eduardo',
    assigned_to: 'Carlos Eduardo',
    dueDate: '2026-08-20',
    desired_date: '2026-08-20',
    submitted_at: '2026-08-11T09:30:00.000Z',
    first_response_at: '2026-08-11T10:15:00.000Z',
    createdAt: '2026-08-11',
    comments: [
      {
        id: 'c-101',
        author: 'Carlos Eduardo',
        text: 'Análise técnica concluída. Encaminhado para aprovação do gestor de TI.',
        createdAt: '2026-08-11T10:15:00.000Z',
      },
    ],
  },
  {
    id: 'dem-1041',
    code: 'DEM-1041',
    title: 'Campanha de Redesign do Flow de Onboarding',
    description: 'Criar wireframes e protótipos interativos para simplificar a entrada de novos clientes.',
    category: 'Marketing',
    channel: 'Redes Sociais & Email Marketing',
    urgency: 'medium',
    impact: 'medium',
    priority_score: 4,
    priority: 'medium',
    status: 'approved',
    requester: 'Mariana Souza',
    assignee: 'Ana Beatriz',
    assigned_to: 'Ana Beatriz',
    dueDate: '2026-08-25',
    desired_date: '2026-08-25',
    submitted_at: '2026-08-09T14:00:00.000Z',
    first_response_at: '2026-08-09T14:45:00.000Z',
    createdAt: '2026-08-09',
    comments: [
      {
        id: 'c-102',
        author: 'Jonathan Müller',
        text: 'Aprovado pelo comitê de produto. Pronto para conversão em projeto.',
        createdAt: '2026-08-09T14:45:00.000Z',
      },
    ],
  },
  {
    id: 'dem-1040',
    code: 'DEM-1040',
    title: 'Relatório Consolidado do Q3 / DRE Operacional',
    description: 'Extrair métricas de desempenho e gastos do trimestre para prestação de contas com diretores.',
    category: 'Financeiro',
    urgency: 'critical',
    impact: 'critical',
    priority_score: 16,
    priority: 'critical',
    justification: 'Requisito legal e auditoria fiscal obrigatória para fechamento contábil do trimestre.',
    status: 'new',
    requester: 'Roberto Alves',
    assignee: 'Fernanda Lima',
    assigned_to: 'Fernanda Lima',
    dueDate: '2026-08-18',
    desired_date: '2026-08-18',
    submitted_at: '2026-08-12T08:10:00.000Z',
    createdAt: '2026-08-12',
    comments: [],
  },
  {
    id: 'dem-1039',
    code: 'DEM-1039',
    title: 'Implementação de Dashboard de Indicadores em Tempo Real',
    description: 'Conectar métricas de engajamento e SLAs de atendimento em cards responsivos.',
    category: 'Tecnologia',
    system_affected: 'CRM & HubTask Core',
    urgency: 'medium',
    impact: 'high',
    priority_score: 6,
    priority: 'medium',
    justification: 'Aumentará a visibilidade dos prazos e reduzirá o tempo médio de resposta.',
    status: 'triage',
    requester: 'Jonathan Müller',
    assignee: 'Carlos Eduardo',
    assigned_to: 'Carlos Eduardo',
    dueDate: '2026-08-22',
    desired_date: '2026-08-22',
    submitted_at: '2026-08-10T11:00:00.000Z',
    first_response_at: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-08-10',
    comments: [
      {
        id: 'c-103',
        author: 'Carlos Eduardo',
        text: 'Em triagem técnica para definição da arquitetura dos websockets.',
        createdAt: '2026-08-10T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'dem-1038',
    code: 'DEM-1038',
    title: 'Auditoria de Segurança & Conformidade LGPD',
    description: 'Revisar logs de acesso e políticas de retenção de dados sensíveis dos clientes.',
    category: 'Operacional',
    urgency: 'low',
    impact: 'high',
    priority_score: 3,
    priority: 'low',
    status: 'converted',
    requester: 'Ana Paula',
    assignee: 'Carlos Eduardo',
    assigned_to: 'Carlos Eduardo',
    dueDate: '2026-08-05',
    desired_date: '2026-08-05',
    submitted_at: '2026-08-01T10:00:00.000Z',
    first_response_at: '2026-08-01T10:30:00.000Z',
    projectId: 'p5',
    createdAt: '2026-08-01',
    comments: [
      {
        id: 'c-104',
        author: 'Jonathan Müller',
        text: 'Demanda aprovada e convertida no projeto PRJ-2026-E.',
        createdAt: '2026-08-01T10:30:00.000Z',
      },
    ],
  },
  {
    id: 'dem-1037',
    code: 'DEM-1037',
    title: 'Solicitação de Aquisição de Licenças Softwares Externos',
    description: 'Compra de 10 licenças de software visual indisponível na esteira padrão.',
    category: 'Outro',
    urgency: 'low',
    impact: 'low',
    priority_score: 1,
    priority: 'low',
    status: 'rejected',
    requester: 'Lucas Silveira',
    assignee: 'Carlos Eduardo',
    assigned_to: 'Carlos Eduardo',
    dueDate: '2026-08-10',
    desired_date: '2026-08-10',
    submitted_at: '2026-08-05T14:00:00.000Z',
    first_response_at: '2026-08-05T14:50:00.000Z',
    createdAt: '2026-08-05',
    comments: [
      {
        id: 'c-105',
        author: 'Jonathan Müller',
        text: 'Indeferido. Já existem ferramentas homologadas equivalentes no ecossistema.',
        createdAt: '2026-08-05T14:50:00.000Z',
      },
    ],
  },
];

export const urgencyWeightMap: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const impactWeightMap: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function calculatePriorityFromScore(score: number): { priority: Priority; label: string } {
  if (score >= 13) return { priority: 'critical', label: 'Crítica' };
  if (score >= 9) return { priority: 'high', label: 'Alta' };
  if (score >= 5) return { priority: 'medium', label: 'Média' };
  return { priority: 'low', label: 'Baixa' };
}

class DemandsService {
  private demands: Demand[] = [];
  private assignmentRules: AssignmentRule[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
      if (savedDemands) {
        this.demands = JSON.parse(savedDemands);
      } else {
        this.demands = [...initialDemands];
        this.saveDemands();
      }

      const savedRules = localStorage.getItem(RULES_STORAGE_KEY);
      if (savedRules) {
        this.assignmentRules = JSON.parse(savedRules);
      } else {
        this.assignmentRules = [...defaultAssignmentRules];
        this.saveRules();
      }
    } catch (e) {
      console.error('Error loading demands data from localStorage', e);
      this.demands = [...initialDemands];
      this.assignmentRules = [...defaultAssignmentRules];
    }
  }

  private saveDemands() {
    localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(this.demands));
    this.notify();
  }

  private saveRules() {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(this.assignmentRules));
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- GETTERS ---
  public getDemands(): Demand[] {
    return [...this.demands];
  }

  public getDemandById(id: string): Demand | undefined {
    return this.demands.find((d) => d.id === id);
  }

  public getAssignmentRules(): AssignmentRule[] {
    return [...this.assignmentRules];
  }

  // --- AUTOMATIC ASSIGNMENT ---
  public getAutoAssigneeForCategory(category: string): string | undefined {
    const rule = this.assignmentRules.find(
      (r) => r.category.toLowerCase() === category.toLowerCase()
    );
    return rule ? rule.assignee : undefined;
  }

  // --- CREATE DEMAND ---
  public createDemand(input: {
    title: string;
    category: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    desired_date: string;
    requester?: string;
    manualAssignee?: string;
    system_affected?: string;
    channel?: string;
    justification?: string;
  }): Demand {
    const urgVal = urgencyWeightMap[input.urgency] || 1;
    const impVal = impactWeightMap[input.impact] || 1;
    const priority_score = urgVal * impVal;
    const { priority } = calculatePriorityFromScore(priority_score);

    // Rule consultation
    const autoAssignee = this.getAutoAssigneeForCategory(input.category);
    const assignee = autoAssignee || input.manualAssignee || 'Aguardando Gestor';

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const nextCodeNum = 1037 + this.demands.length + 1;
    const code = `DEM-${nextCodeNum}`;

    const newDemand: Demand = {
      id: `dem_${Date.now()}`,
      code,
      title: input.title,
      category: input.category,
      description: input.description,
      urgency: input.urgency,
      impact: input.impact,
      priority_score,
      priority,
      status: 'new',
      requester: input.requester || 'Jonathan Müller',
      assignee,
      assigned_to: assignee,
      dueDate: input.desired_date,
      desired_date: input.desired_date,
      system_affected: input.system_affected,
      channel: input.channel,
      justification: input.justification,
      submitted_at: nowIso,
      createdAt: todayStr,
      comments: [],
    };

    this.demands.unshift(newDemand);
    this.saveDemands();
    return newDemand;
  }

  // --- UPDATE DEMAND STATUS ---
  public updateDemandStatus(
    id: string,
    newStatus: DemandStatus,
    commentText?: string,
    authorName: string = 'Gestor'
  ): Demand | undefined {
    const index = this.demands.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    const current = this.demands[index];
    const updates: Partial<Demand> = {
      status: newStatus,
    };

    // Record first response SLA timestamp if changing status from 'new' for the first time
    if (!current.first_response_at && current.status === 'new' && newStatus !== 'new') {
      updates.first_response_at = new Date().toISOString();
    }

    let updatedComments = current.comments ? [...current.comments] : [];
    if (commentText && commentText.trim()) {
      updatedComments.push({
        id: `c_${Date.now()}`,
        author: authorName,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    this.demands[index] = {
      ...current,
      ...updates,
      comments: updatedComments,
    };

    this.saveDemands();
    return this.demands[index];
  }

  // --- ADD COMMENT ---
  public addComment(id: string, author: string, text: string): Demand | undefined {
    const index = this.demands.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    const current = this.demands[index];
    const newComment: DemandComment = {
      id: `c_${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(current.comments || []), newComment];
    this.demands[index] = {
      ...current,
      comments: updatedComments,
    };

    this.saveDemands();
    return this.demands[index];
  }

  // --- ASSIGN DEMAND MANUALLY ---
  public assignDemand(id: string, assignee: string): Demand | undefined {
    const index = this.demands.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    this.demands[index] = {
      ...this.demands[index],
      assignee,
      assigned_to: assignee,
    };

    this.saveDemands();
    return this.demands[index];
  }

  // --- CONVERT DEMAND TO PROJECT ---
  public convertDemandToProject(
    demandId: string,
    managerName: string = 'Jonathan Müller'
  ): { demand: Demand; project: Project } | undefined {
    const demand = this.getDemandById(demandId);
    if (!demand) return undefined;

    // Create a new project in projectsService
    const projectPriority = demand.priority === 'urgent' ? 'critical' : (demand.priority as any);

    const createdProject = projectsService.createProject({
      name: demand.title,
      description: `Projeto gerado a partir da demanda ${demand.code}: ${demand.description}`,
      department: demand.category,
      status: 'planning',
      priority: projectPriority,
      assignee: demand.assignee || 'Carlos Eduardo',
      manager: managerName,
      startDate: getBrasiliaDateString(),
      endDate: demand.dueDate || demand.desired_date || getBrasiliaDateString(),
      baseline: demand.dueDate || demand.desired_date || getBrasiliaDateString(),
      progress: 0,
      membersCount: 3,
    });

    // Update demand status to converted and link projectId
    const nowIso = new Date().toISOString();
    const index = this.demands.findIndex((d) => d.id === demandId);
    
    const commentText = `Demanda convertida com sucesso no Projeto ${createdProject.code} (${createdProject.name}).`;
    const updatedComments = [...(this.demands[index].comments || []), {
      id: `c_${Date.now()}`,
      author: managerName,
      text: commentText,
      createdAt: nowIso,
    }];

    this.demands[index] = {
      ...this.demands[index],
      status: 'converted',
      projectId: createdProject.id,
      first_response_at: this.demands[index].first_response_at || nowIso,
      comments: updatedComments,
    };

    this.saveDemands();
    return { demand: this.demands[index], project: createdProject };
  }

  // --- SLA & METRICS CALCULATIONS ---
  public calculateDemandSLA(demand: Demand): { minutes: number; formatted: string } | null {
    if (!demand.submitted_at || !demand.first_response_at) return null;

    const submitted = new Date(demand.submitted_at).getTime();
    const responded = new Date(demand.first_response_at).getTime();
    const diffMs = responded - submitted;
    if (diffMs < 0) return { minutes: 0, formatted: '0 min' };

    const minutes = Math.round(diffMs / (1000 * 60));
    if (minutes < 60) {
      return { minutes, formatted: `${minutes} min` };
    }
    const hours = (minutes / 60).toFixed(1);
    return { minutes, formatted: `${hours}h` };
  }

  public getMetrics() {
    // 1. Demandas abertas
    const openStatuses: DemandStatus[] = ['new', 'triage', 'waiting_approval', 'approved'];
    const openDemandsCount = this.demands.filter((d) => openStatuses.includes(d.status)).length;

    // 2. SLA Médio
    const respondedDemands = this.demands.filter((d) => d.submitted_at && d.first_response_at);
    let avgSLAMinutes = 0;
    if (respondedDemands.length > 0) {
      const totalMinutes = respondedDemands.reduce((acc, d) => {
        const sla = this.calculateDemandSLA(d);
        return acc + (sla ? sla.minutes : 0);
      }, 0);
      avgSLAMinutes = Math.round(totalMinutes / respondedDemands.length);
    }

    let avgSLAFormatted = '0 min';
    if (avgSLAMinutes < 60) {
      avgSLAFormatted = `${avgSLAMinutes} min`;
    } else {
      avgSLAFormatted = `${(avgSLAMinutes / 60).toFixed(1)}h`;
    }

    // 3. Taxa de conversão (% of total demands that are converted)
    const convertedCount = this.demands.filter((d) => d.status === 'converted').length;
    const totalCount = this.demands.length;
    const conversionRate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;

    return {
      openDemandsCount,
      avgSLAMinutes,
      avgSLAFormatted,
      convertedCount,
      totalCount,
      conversionRate,
    };
  }
}

export const demandsService = new DemandsService();
