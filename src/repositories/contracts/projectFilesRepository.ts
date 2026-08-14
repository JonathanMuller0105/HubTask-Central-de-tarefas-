import type { ProjectFile } from '../../types';

export interface ProjectFileUpload {
  projectId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  content: Blob;
}

export interface ProjectFileAccess {
  url: string;
  expiresAt?: string;
}

export interface ProjectFilesRepository {
  list(projectId: string): Promise<ProjectFile[]>;
  upload(input: ProjectFileUpload): Promise<ProjectFile>;
  getAccess(fileId: string): Promise<ProjectFileAccess>;
  delete(fileId: string): Promise<boolean>;
}
