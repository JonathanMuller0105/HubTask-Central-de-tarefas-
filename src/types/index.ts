export type Theme = 'light' | 'dark' | 'system';
export type UserRole = 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  userRole: UserRole;
  department: string;
}

export interface NavItem {
  title: string;
  path: string;
  icon: string;
  badge?: string;
  count?: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type DemandStatus = 'new' | 'triage' | 'waiting_approval' | 'approved' | 'rejected' | 'converted' | 'backlog' | 'in_progress' | 'completed';

export interface DemandComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AssignmentRule {
  id: string;
  category: string;
  assignee: string;
}

export interface Demand {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'Tecnologia' | 'Marketing' | 'Administrativo' | 'Financeiro' | 'Operacional' | 'Outro' | string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority_score: number;
  priority: Priority;
  status: DemandStatus;
  requester: string;
  assignee: string;
  assigned_to?: string;
  dueDate: string;
  desired_date?: string;
  
  // Conditional fields
  system_affected?: string; // If category === Tecnologia
  channel?: string; // If category === Marketing
  justification?: string; // If impact === high/critical
  
  // SLA tracking
  submitted_at: string;
  first_response_at?: string;
  
  // Comments and Project Link
  comments?: DemandComment[];
  projectId?: string;
  createdAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  assignee: string; // Responsável
  manager: string; // Manager/Gestor
  startDate: string; // Data Inicial
  endDate: string; // Prazo / Data Final
  baseline: string; // Baseline de Entrega
  progress: number; // 0 to 100
  membersCount: number;
  isAtRisk?: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  progress: number; // 0 to 100
  startDate: string;
  dueDate: string;
  baselineStart?: string;
  baselineDue?: string;
}

export type DependencyType = 'FS'; // Finish-to-Start (MVP)

export interface TaskDependency {
  id: string;
  projectId: string;
  predecessorId: string; // Task that must complete first
  successorId: string;   // Task that starts after predecessor
  type: DependencyType;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  type: string;
}

export type CalendarEventType = 'meeting' | 'focus' | 'task' | 'project' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  time?: string; // Formatted display e.g. "09:00 - 10:30"
  type: CalendarEventType;
  project_id?: string;
  task_id?: string;
  location?: string;
  color?: string;
  
  // External Calendar Synchronization fields
  external_provider?: 'google_calendar' | 'outlook';
  external_id?: string;
  sync_status?: 'synced' | 'pending' | 'blocked_pending_server' | 'error';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatar: string;
  email: string;
  activeTasksCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'demand' | 'project' | 'calendar' | 'system';
}

