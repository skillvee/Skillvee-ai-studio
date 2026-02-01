export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  senderName: string;
}

export interface CoworkerKnowledge {
  topic: string;
  triggerKeywords: string[];
  response: string;
  isCritical: boolean;
}

export interface Coworker {
  id: string;
  name: string;
  role: string;
  personaStyle: string;
  avatarUrl: string;
  voiceName: string;
  isOnline: boolean;
  knowledge: CoworkerKnowledge[];
}

export interface Scenario {
  id: string;
  companyName: string;
  companyDescription: string;
  taskDescription: string;
  techStack: string[];
  repoUrl: string;
}

export interface AssessmentContext {
  candidateName: string;
  scenario: Scenario;
  coworkers: Coworker[];
  managerId: string;
}

export type AssessmentStatus = 'WELCOME' | 'WORKING' | 'COMPLETED';

export interface AssessmentState {
  id: string;
  status: AssessmentStatus;
  scenarioId: string;
  candidateName: string;
  prUrl: string | null;
  managerMessagesStarted: boolean;
  defenseCallStarted: boolean;
  startedAt: Date;
  completedAt: Date | null;
}