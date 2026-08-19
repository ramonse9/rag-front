export type RequirementImportance = "required" | "preferred" | "valuable";

export type RequirementMatch = "strong" | "partial" | "gap";

export type JobAnalysisIntent =
  | "match"
  | "gaps"
  | "strengths"
  | "interview"
  | "unsupported";

export interface JobRequirement {
  requirement: string;
  category: string;
  importance: RequirementImportance;
}

export interface JobEvidenceChunk {
  content: string;
  filename: string;
  chunkIndex: number;
  distance: number;
}

export interface RequirementEvidence {
  requirement: string;
  evidence: JobEvidenceChunk[];
}

export interface RequirementEvaluation {
  requirement: string;
  importance: RequirementImportance;
  match: RequirementMatch;
  explanation: string;
  evidence: string[];
}

export interface JobAnalysisResponse {
  jobDescription: string;
  question: string;
  requestValid: boolean;
  validationReason?: string;
  requirements: JobRequirement[];
  evidence: RequirementEvidence[];
  evaluations: RequirementEvaluation[];
  intent?: JobAnalysisIntent;
  answer: string;
}
