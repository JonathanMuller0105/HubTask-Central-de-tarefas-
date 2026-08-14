import type { Project } from '../../types';

export interface ProjectsRepository {
  list(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(data: Omit<Project, 'id' | 'code'>): Promise<Project>;
  update(id: string, updates: Partial<Project>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}
