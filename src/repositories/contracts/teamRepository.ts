import type { PrivateDiversityProfile, TeamMember } from '../../types';

export interface CreateTeamMemberPreRegistration {
  name: string;
  email: string;
  role: string;
  department: string;
  workdayHours: number;
  functions: string[];
  assignedDemandIds: string[];
}

export interface TeamDirectoryRepository {
  listMembers(): Promise<TeamMember[]>;
  createPreRegistration(input: CreateTeamMemberPreRegistration): Promise<TeamMember>;
}

export interface MyPrivateProfileRepository {
  getMine(): Promise<PrivateDiversityProfile | null>;
  saveMine(profile: PrivateDiversityProfile): Promise<PrivateDiversityProfile>;
}
