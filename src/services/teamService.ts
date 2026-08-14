import { PrivateDiversityProfile, TeamMember } from '../types';
import { mockTeamMembers } from './mockData';

export const TEAM_MEMBERS_STORAGE_KEY = 'hubtask_team_members_v1';
export const PRIVATE_DIVERSITY_PROFILE_STORAGE_KEY = 'hubtask_private_diversity_profile_v1';

export interface NewTeamMemberInput {
  name: string;
  email: string;
  role: string;
  department: string;
  workdayHours: number;
  functions: string[];
  assignedDemandIds: string[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export const teamService = {
  getMembers(): TeamMember[] {
    try {
      const stored = localStorage.getItem(TEAM_MEMBERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...mockTeamMembers];
    } catch {
      return [...mockTeamMembers];
    }
  },

  createPreRegistration(input: NewTeamMemberInput): TeamMember {
    const members = this.getMembers();
    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      department: input.department,
      avatar: initials(input.name),
      status: 'offline',
      activeTasksCount: 0,
      workdayHours: input.workdayHours,
      functions: input.functions,
      assignedDemandIds: input.assignedDemandIds,
      registrationStatus: 'pre_registered',
    };
    localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify([...members, member]));
    return member;
  },

  saveMyPrivateProfile(profile: PrivateDiversityProfile) {
    localStorage.setItem(PRIVATE_DIVERSITY_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  },

  getMyPrivateProfile(memberId: string): PrivateDiversityProfile | null {
    try {
      const stored = localStorage.getItem(PRIVATE_DIVERSITY_PROFILE_STORAGE_KEY);
      if (!stored) return null;
      const profile = JSON.parse(stored) as PrivateDiversityProfile;
      return profile.memberId === memberId ? profile : null;
    } catch {
      return null;
    }
  },
};
