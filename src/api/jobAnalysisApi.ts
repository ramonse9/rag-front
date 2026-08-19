import { getApiBaseUrl } from "../config/env";
import type {
  JobAnalysisIntent,
  JobAnalysisResponse,
  JobEvidenceChunk,
  JobRequirement,
  RequirementEvaluation,
  RequirementEvidence,
  RequirementImportance,
  RequirementMatch,
} from "../types/jobAnalysis";

export type JobAnalysisErrorCode =
  | "configuration"
  | "validation"
  | "network"
  | "http"
  | "malformed-response"
  | "cancelled";

export class JobAnalysisError extends Error {
  constructor(
    public readonly code: JobAnalysisErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "JobAnalysisError";
  }
}

const requirementImportances: ReadonlySet<RequirementImportance> = new Set([
  "required",
  "preferred",
  "valuable",
]);

const requirementMatches: ReadonlySet<RequirementMatch> = new Set([
  "strong",
  "partial",
  "gap",
]);

const jobAnalysisIntents: ReadonlySet<JobAnalysisIntent> = new Set([
  "match",
  "gaps",
  "strengths",
  "interview",
  "unsupported",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isImportance(value: unknown): value is RequirementImportance {
  return typeof value === "string" && requirementImportances.has(value as RequirementImportance);
}

function isMatch(value: unknown): value is RequirementMatch {
  return typeof value === "string" && requirementMatches.has(value as RequirementMatch);
}

function isIntent(value: unknown): value is JobAnalysisIntent {
  return typeof value === "string" && jobAnalysisIntents.has(value as JobAnalysisIntent);
}

function isJobRequirement(value: unknown): value is JobRequirement {
  return (
    isRecord(value) &&
    isNonEmptyString(value.requirement) &&
    isNonEmptyString(value.category) &&
    isImportance(value.importance)
  );
}

function isJobEvidenceChunk(value: unknown): value is JobEvidenceChunk {
  return (
    isRecord(value) &&
    typeof value.content === "string" &&
    isNonEmptyString(value.filename) &&
    Number.isInteger(value.chunkIndex) &&
    typeof value.distance === "number" &&
    Number.isFinite(value.distance)
  );
}

function isRequirementEvidence(value: unknown): value is RequirementEvidence {
  return (
    isRecord(value) &&
    isNonEmptyString(value.requirement) &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isJobEvidenceChunk)
  );
}

function isRequirementEvaluation(value: unknown): value is RequirementEvaluation {
  return (
    isRecord(value) &&
    isNonEmptyString(value.requirement) &&
    isImportance(value.importance) &&
    isMatch(value.match) &&
    isNonEmptyString(value.explanation) &&
    Array.isArray(value.evidence) &&
    value.evidence.every((item) => typeof item === "string")
  );
}

function isJobAnalysisResponse(value: unknown): value is JobAnalysisResponse {
  return (
    isRecord(value) &&
    isNonEmptyString(value.jobDescription) &&
    isNonEmptyString(value.question) &&
    typeof value.requestValid === "boolean" &&
    (value.validationReason === undefined || typeof value.validationReason === "string") &&
    Array.isArray(value.requirements) &&
    value.requirements.every(isJobRequirement) &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isRequirementEvidence) &&
    Array.isArray(value.evaluations) &&
    value.evaluations.every(isRequirementEvaluation) &&
    (value.intent === undefined || isIntent(value.intent)) &&
    typeof value.answer === "string"
  );
}

function logDevelopmentError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(context, error);
  }
}

export async function analyzeJob(
  jobDescription: string,
  question: string,
  signal?: AbortSignal,
): Promise<JobAnalysisResponse> {
  const normalizedJobDescription = jobDescription.trim();
  const normalizedQuestion = question.trim();

  if (!normalizedJobDescription || !normalizedQuestion) {
    throw new JobAnalysisError(
      "validation",
      "Enter both a job description and a question before submitting.",
    );
  }

  let apiBaseUrl: string;
  try {
    apiBaseUrl = getApiBaseUrl();
  } catch (error) {
    logDevelopmentError("Invalid frontend API configuration.", error);
    throw new JobAnalysisError(
      "configuration",
      "The job analysis service is not configured. Please contact the site administrator.",
      { cause: error },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/job-analysis/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobDescription: normalizedJobDescription,
        question: normalizedQuestion,
      }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      throw new JobAnalysisError("cancelled", "The analysis was cancelled.", {
        cause: error,
      });
    }

    logDevelopmentError("Job Analysis API network request failed.", error);
    throw new JobAnalysisError(
      "network",
      "Unable to reach the job analysis service. Check your connection and try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    logDevelopmentError("Job Analysis API returned an HTTP error.", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new JobAnalysisError(
      "http",
      "The job analysis service could not complete your request. Please try again.",
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    logDevelopmentError("Job Analysis API response was not valid JSON.", error);
    throw new JobAnalysisError(
      "malformed-response",
      "The job analysis service returned an unexpected response. Please try again.",
      { cause: error },
    );
  }

  if (!isJobAnalysisResponse(data)) {
    logDevelopmentError(
      "Job Analysis API response did not match the expected contract.",
      data,
    );
    throw new JobAnalysisError(
      "malformed-response",
      "The job analysis service returned an unexpected response. Please try again.",
    );
  }

  return data;
}
