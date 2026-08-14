import type { DependencyType, Task, TaskDependency } from '../../types';

export interface AddTaskDependencyResult {
  success: boolean;
  error?: string;
  dependency?: TaskDependency;
}

export interface TasksRepository {
  list(projectId?: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(data: Omit<Task, 'id' | 'code'>): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  listDependencies(projectId?: string): Promise<TaskDependency[]>;
  addDependency(
    projectId: string,
    predecessorId: string,
    successorId: string,
    type?: DependencyType,
  ): Promise<AddTaskDependencyResult>;
  deleteDependency(id: string): Promise<boolean>;
}
