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

export type RecordingStatus = 'idle' | 'recording' | 'interrupted' | 'error' | 'denied';

export interface ScreenRecorderHook {
  status: RecordingStatus;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  resumeRecording: () => Promise<boolean>;
  screenshots: Blob[];
  videoBlob: Blob | null;
}

// --- EVALUATION TYPES ---

export type DimensionName = 
  | 'COMMUNICATION'
  | 'PROBLEM_SOLVING'
  | 'TECHNICAL_KNOWLEDGE'
  | 'COLLABORATION'
  | 'ADAPTABILITY'
  | 'LEADERSHIP'
  | 'CREATIVITY'
  | 'TIME_MANAGEMENT';

export interface DimensionScore {
  score: number | null; // 1-5
  rationale: string;
  greenFlags: string[];
  redFlags: string[];
  observableBehaviors: string;
  timestamps: string[];
  trainableGap: boolean;
}

export interface KeyHighlight {
  timestamp: string;
  type: 'positive' | 'negative';
  dimension: DimensionName;
  description: string;
  quote: string | null;
}

export type Recommendation = 'hire' | 'maybe' | 'no_hire';

export interface EvaluationResult {
  overallScore: number;
  dimensionScores: Record<DimensionName, DimensionScore>;
  overallGreenFlags: string[];
  overallRedFlags: string[];
  recommendation: Recommendation;
  recommendationRationale: string;
  keyHighlights: KeyHighlight[];
  overallSummary: string;
  confidence: 'high' | 'medium' | 'low';
}

export type EvaluationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface VideoEvaluationState {
  status: EvaluationStatus;
  result: EvaluationResult | null;
  error: string | null;
}