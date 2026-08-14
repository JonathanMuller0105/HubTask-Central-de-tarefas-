import type {
  AssignmentRule,
  Demand,
  DemandStatus,
  Project,
} from '../../types';

export interface CreateDemandInput {
  title: string;
  category: string;
  description: string;
  urgency: Demand['urgency'];
  impact: Demand['impact'];
  desiredDate: string;
  requesterId?: string;
  manualAssigneeId?: string;
  systemAffected?: string;
  channel?: string;
  justification?: string;
}

export interface DemandsRepository {
  list(): Promise<Demand[]>;
  findById(id: string): Promise<Demand | null>;
  create(input: CreateDemandInput): Promise<Demand>;
  updateStatus(id: string, status: DemandStatus, commentText?: string): Promise<Demand | null>;
  addComment(id: string, text: string): Promise<Demand | null>;
  assign(id: string, assigneeId: string): Promise<Demand | null>;
  listAssignmentRules(): Promise<AssignmentRule[]>;
  findAutoAssigneeId(category: string): Promise<string | null>;
  convertToProject(demandId: string): Promise<{ demand: Demand; project: Project } | null>;
}
