import { Project, Task, ProjectFile, ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, TaskDependency, DependencyType } from '../types';
import { detectCycle } from '../utils/cpmCalculator';
import { getBrasiliaDateString } from '../lib/utils';

const PROJECTS_STORAGE_KEY = 'hubtask_projects';
const TASKS_STORAGE_KEY = 'hubtask_tasks';
const FILES_STORAGE_KEY = 'hubtask_files';
const DEPENDENCIES_STORAGE_KEY = 'hubtask_task_dependencies';

export const initialProjects: Project[] = [
  {
    id: 'p1',
    code: 'PRJ-2026-A',
    name: 'Portal do Colaborador 2.0',
    description: 'Migração completa da intranet legado para portal Web com auto-serviço de RH, marcação de férias e contracheque online.',
    department: 'Recursos Humanos',
    status: 'active',
    priority: 'high',
    assignee: 'Carlos Eduardo',
    manager: 'Jonathan Müller',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    baseline: '2026-09-15',
    progress: 78,
    membersCount: 8,
    isAtRisk: false,
  },
  {
    id: 'p2',
    code: 'PRJ-2026-B',
    name: 'Automação de Pipelines CI/CD',
    description: 'Padronizar o deploy dos microsserviços do HubTask com testes automatizados no GitHub Actions e Cloud Run.',
    department: 'Engenharia de Software',
    status: 'active',
    priority: 'critical',
    assignee: 'Lucas Silveira',
    manager: 'Jonathan Müller',
    startDate: '2026-07-10',
    endDate: '2026-08-31',
    baseline: '2026-08-20',
    progress: 92,
    membersCount: 5,
    isAtRisk: false,
  },
  {
    id: 'p3',
    code: 'PRJ-2026-C',
    name: 'Reformulação da Marca Institucional',
    description: 'Criação do novo manual de marca, assets de comunicação e redes sociais para o lançamento oficial do HubTask.',
    department: 'Marketing & Design',
    status: 'planning',
    priority: 'medium',
    assignee: 'Ana Beatriz',
    manager: 'Mariana Souza',
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    baseline: '2026-11-01',
    progress: 45,
    membersCount: 12,
    isAtRisk: false,
  },
  {
    id: 'p4',
    code: 'PRJ-2026-D',
    name: 'Consolidação do Data Lake Interno',
    description: 'Centralização das bases SQL e logs em data lake corporativo com relatórios automatizados no Looker.',
    department: 'Data & Analytics',
    status: 'completed',
    priority: 'high',
    assignee: 'Fernanda Lima',
    manager: 'Jonathan Müller',
    startDate: '2026-04-01',
    endDate: '2026-08-01',
    baseline: '2026-08-01',
    progress: 100,
    membersCount: 6,
    isAtRisk: false,
  },
  {
    id: 'p5',
    code: 'PRJ-2026-E',
    name: 'Auditoria de Segurança da Informação',
    description: 'Avaliação de vulnerabilidades e certificação de conformidade com ISO 27001 e LGPD nos sistemas internos.',
    department: 'Segurança & Conformidade',
    status: 'active',
    priority: 'critical',
    assignee: 'Carlos Eduardo',
    manager: 'Jonathan Müller',
    startDate: '2026-05-01',
    endDate: '2026-08-05', // Atrasado
    baseline: '2026-07-30',
    progress: 60,
    membersCount: 4,
    isAtRisk: true,
  },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    code: 'TSK-101',
    title: 'Módulo de solicitação de férias',
    description: 'Desenvolver formulários e fluxo de aprovação com o gestor direto.',
    status: 'done',
    priority: 'high',
    assignee: 'Carlos Eduardo',
    progress: 100,
    startDate: '2026-06-05',
    dueDate: '2026-07-15',
    baselineStart: '2026-06-05',
    baselineDue: '2026-07-15',
  },
  {
    id: 't2',
    projectId: 'p1',
    code: 'TSK-102',
    title: 'Integração com folha de pagamento',
    description: 'Conectar APIs da Senior/TOTVS para sincronização automática de holerites.',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Carlos Eduardo',
    progress: 75,
    startDate: '2026-07-16',
    dueDate: '2026-08-20',
    baselineStart: '2026-07-16',
    baselineDue: '2026-08-15',
  },
  {
    id: 't3',
    projectId: 'p1',
    code: 'TSK-103',
    title: 'Testes de usabilidade no mobile',
    description: 'Validar responsividade em dispositivos iOS e Android.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Ana Beatriz',
    progress: 0,
    startDate: '2026-08-21',
    dueDate: '2026-09-10',
    baselineStart: '2026-08-16',
    baselineDue: '2026-09-05',
  },
  {
    id: 't4',
    projectId: 'p2',
    code: 'TSK-201',
    title: 'Configuração dos Runners do GitHub Actions',
    description: 'Provisionar instâncias dedicadas para builds mais rápidos.',
    status: 'done',
    priority: 'high',
    assignee: 'Lucas Silveira',
    progress: 100,
    startDate: '2026-07-11',
    dueDate: '2026-07-20',
    baselineStart: '2026-07-11',
    baselineDue: '2026-07-20',
  },
  {
    id: 't5',
    projectId: 'p2',
    code: 'TSK-202',
    title: 'Script de rollback automático em falhas',
    description: 'Implementar health check pós-deploy com reversão em caso de erro 5xx.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Lucas Silveira',
    progress: 85,
    startDate: '2026-07-21',
    dueDate: '2026-08-18',
    baselineStart: '2026-07-21',
    baselineDue: '2026-08-15',
  },
  {
    id: 't6',
    projectId: 'p3',
    code: 'TSK-301',
    title: 'Definição da paleta de cores primária',
    description: 'Selecionar e aprovar variação de tons com a diretoria.',
    status: 'done',
    priority: 'medium',
    assignee: 'Ana Beatriz',
    progress: 100,
    startDate: '2026-08-15',
    dueDate: '2026-08-16',
    baselineStart: '2026-08-15',
    baselineDue: '2026-08-16',
  },
  {
    id: 't7',
    projectId: 'p3',
    code: 'TSK-302',
    title: 'Modelos de apresentação em PDF',
    description: 'Criar templates reutilizáveis no Figma e Canva.',
    status: 'in_progress',
    priority: 'low',
    assignee: 'Mariana Souza',
    progress: 30,
    startDate: '2026-08-17',
    dueDate: '2026-09-01',
    baselineStart: '2026-08-17',
    baselineDue: '2026-08-30',
  },
  {
    id: 't8',
    projectId: 'p5',
    code: 'TSK-501',
    title: 'Relatório final de varredura de vulnerabilidades',
    description: 'Consolidar apontamentos das ferramentas de Pentest.',
    status: 'blocked',
    priority: 'critical',
    assignee: 'Jonathan Müller',
    progress: 40,
    startDate: '2026-05-10',
    dueDate: '2026-08-04', // Overdue
    baselineStart: '2026-05-10',
    baselineDue: '2026-07-30',
  },
  {
    id: 't9',
    projectId: 'p5',
    code: 'TSK-502',
    title: 'Correção das brechas de injeção SQL no legado',
    description: 'Refatorar queries vulneráveis utilizando ORM parametrizado.',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Carlos Eduardo',
    progress: 50,
    startDate: '2026-06-01',
    dueDate: '2026-08-08', // Overdue
    baselineStart: '2026-06-01',
    baselineDue: '2026-07-30',
  },
];

export const initialDependencies: TaskDependency[] = [
  { id: 'dep1', projectId: 'p1', predecessorId: 't1', successorId: 't2', type: 'FS' },
  { id: 'dep2', projectId: 'p1', predecessorId: 't2', successorId: 't3', type: 'FS' },
  { id: 'dep3', projectId: 'p2', predecessorId: 't4', successorId: 't5', type: 'FS' },
  { id: 'dep4', projectId: 'p3', predecessorId: 't6', successorId: 't7', type: 'FS' },
  { id: 'dep5', projectId: 'p5', predecessorId: 't8', successorId: 't9', type: 'FS' },
];

export const initialFiles: ProjectFile[] = [
  {
    id: 'f1',
    projectId: 'p1',
    name: 'Estatuto_do_Projeto_v1.2.pdf',
    size: '2.4 MB',
    uploadedBy: 'Jonathan Müller',
    uploadedAt: '2026-06-02',
    type: 'pdf',
  },
  {
    id: 'f2',
    projectId: 'p1',
    name: 'Arquitetura_Portal_Colaborador.png',
    size: '1.8 MB',
    uploadedBy: 'Carlos Eduardo',
    uploadedAt: '2026-06-10',
    type: 'image',
  },
  {
    id: 'f3',
    projectId: 'p5',
    name: 'Relatorio_Auditoria_LGPD.docx',
    size: '850 KB',
    uploadedBy: 'Jonathan Müller',
    uploadedAt: '2026-05-15',
    type: 'doc',
  },
];

class ProjectsService {
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private files: ProjectFile[] = [];
  private taskDependencies: TaskDependency[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (savedProjects) {
        this.projects = JSON.parse(savedProjects);
      } else {
        this.projects = [...initialProjects];
        this.saveProjects();
      }

      const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      } else {
        this.tasks = [...initialTasks];
        this.saveTasks();
      }

      const savedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      if (savedFiles) {
        this.files = JSON.parse(savedFiles);
      } else {
        this.files = [...initialFiles];
        this.saveFiles();
      }

      const savedDeps = localStorage.getItem(DEPENDENCIES_STORAGE_KEY);
      if (savedDeps) {
        this.taskDependencies = JSON.parse(savedDeps);
      } else {
        this.taskDependencies = [...initialDependencies];
        this.saveDependencies();
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      this.projects = [...initialProjects];
      this.tasks = [...initialTasks];
      this.files = [...initialFiles];
      this.taskDependencies = [...initialDependencies];
    }
  }

  private saveProjects() {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(this.projects));
    this.notify();
  }

  private saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
    this.notify();
  }

  private saveFiles() {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(this.files));
    this.notify();
  }

  private saveDependencies() {
    localStorage.setItem(DEPENDENCIES_STORAGE_KEY, JSON.stringify(this.taskDependencies));
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

  // --- PROJECTS CRUD ---
  public getProjects(): Project[] {
    return [...this.projects];
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public createProject(data: Omit<Project, 'id' | 'code'>): Project {
    const nextNum = this.projects.length + 1;
    const code = `PRJ-2026-${String.fromCharCode(64 + nextNum)}`;
    const newProject: Project = {
      ...data,
      id: `p_${Date.now()}`,
      code,
    };
    this.projects.unshift(newProject);
    this.saveProjects();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
    };
    this.saveProjects();
    return this.projects[index];
  }

  public deleteProject(id: string): boolean {
    const initialLen = this.projects.length;
    this.projects = this.projects.filter((p) => p.id !== id);
    this.tasks = this.tasks.filter((t) => t.projectId !== id);
    this.files = this.files.filter((f) => f.projectId !== id);
    if (this.projects.length !== initialLen) {
      this.saveProjects();
      this.saveTasks();
      this.saveFiles();
      return true;
    }
    return false;
  }

  // --- TASKS CRUD ---
  public getTasks(projectId?: string): Task[] {
    if (projectId) {
      return this.tasks.filter((t) => t.projectId === projectId);
    }
    return [...this.tasks];
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public createTask(data: Omit<Task, 'id' | 'code'>): Task {
    const nextNum = this.tasks.length + 101;
    const newTask: Task = {
      ...data,
      id: `t_${Date.now()}`,
      code: `TSK-${nextNum}`,
    };
    this.tasks.push(newTask);
    this.saveTasks();
    this.recalculateProjectProgress(newTask.projectId);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
    };
    this.saveTasks();
    this.recalculateProjectProgress(this.tasks[index].projectId);
    return this.tasks[index];
  }

  public deleteTask(id: string): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;
    const projectId = task.projectId;

    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
    this.recalculateProjectProgress(projectId);
    return true;
  }

  private recalculateProjectProgress(projectId: string) {
    const projTasks = this.tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return;

    const totalProgress = projTasks.reduce((acc, t) => acc + (t.progress || (t.status === 'done' ? 100 : 0)), 0);
    const avgProgress = Math.round(totalProgress / projTasks.length);

    this.updateProject(projectId, { progress: avgProgress });
  }

  // --- DEPENDENCIES CRUD ---
  public getDependencies(projectId?: string): TaskDependency[] {
    if (projectId) {
      return this.taskDependencies.filter((d) => d.projectId === projectId);
    }
    return [...this.taskDependencies];
  }

  public addDependency(
    projectId: string,
    predecessorId: string,
    successorId: string,
    type: DependencyType = 'FS'
  ): { success: boolean; error?: string; dependency?: TaskDependency } {
    if (predecessorId === successorId) {
      return { success: false, error: 'Uma tarefa não pode depender de si mesma.' };
    }

    // Check if duplicate
    const exists = this.taskDependencies.some(
      (d) => d.projectId === projectId && d.predecessorId === predecessorId && d.successorId === successorId
    );
    if (exists) {
      return { success: false, error: 'Esta relação de dependência já existe.' };
    }

    // Detect cycle before saving
    const hasCycle = detectCycle(this.taskDependencies, predecessorId, successorId);
    if (hasCycle) {
      return {
        success: false,
        error: 'Não foi possível adicionar dependência: detectado ciclo no grafo de tarefas.',
      };
    }

    const newDep: TaskDependency = {
      id: `dep_${Date.now()}`,
      projectId,
      predecessorId,
      successorId,
      type,
    };

    this.taskDependencies.push(newDep);
    this.saveDependencies();
    return { success: true, dependency: newDep };
  }

  public deleteDependency(id: string): boolean {
    const prevLen = this.taskDependencies.length;
    this.taskDependencies = this.taskDependencies.filter((d) => d.id !== id);
    if (this.taskDependencies.length !== prevLen) {
      this.saveDependencies();
      return true;
    }
    return false;
  }

  // --- FILES CRUD ---
  public getFiles(projectId: string): ProjectFile[] {
    return this.files.filter((f) => f.projectId === projectId);
  }

  public addFile(projectId: string, fileName: string, uploadedBy: string, contentUrl?: string, mimeType?: string, size?: string): ProjectFile {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'file';
    const newFile: ProjectFile = {
      id: `f_${Date.now()}`,
      projectId,
      name: fileName,
      size: size || `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      uploadedBy,
      uploadedAt: getBrasiliaDateString(),
      type: ext,
      mimeType,
      contentUrl,
    };
    this.files.unshift(newFile);
    this.saveFiles();
    return newFile;
  }

  public deleteFile(id: string, requestedBy: string): boolean {
    const file = this.files.find((item) => item.id === id);
    if (!file || file.uploadedBy.trim().toLocaleLowerCase('pt-BR') !== requestedBy.trim().toLocaleLowerCase('pt-BR')) {
      return false;
    }
    this.files = this.files.filter((f) => f.id !== id);
    this.saveFiles();
    return true;
  }

  // --- HELPER CALCULATIONS & FILTERS ---
  public isProjectOverdue(project: Project): boolean {
    if (project.status === 'completed' || project.status === 'cancelled') return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return project.endDate < todayStr;
  }

  public isProjectAtRisk(project: Project): boolean {
    if (project.status === 'completed' || project.status === 'cancelled') return false;
    if (project.isAtRisk) return true;
    if (this.isProjectOverdue(project)) return true;

    // Check if progress is low (<50%) and due date is within 10 days
    const today = new Date();
    const end = new Date(project.endDate);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 10 && project.progress < 50) return true;

    return false;
  }

  public isTaskOverdue(task: Task): boolean {
    if (task.status === 'done') return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  }
}

export const projectsService = new ProjectsService();
