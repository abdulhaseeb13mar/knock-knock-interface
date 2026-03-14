export type JobStatus = "RUNNING" | "PAUSED" | "COMPLETED";

export interface EmailJob {
  id: string;
  userId: string;
  status: JobStatus;
  total: number;
  sentCount: number;
  failedCount: number;
  startedAt: string;
  completedAt?: string | null;
  pauseReason?: string | null;
}

export type StartJobResponse = EmailJob | { message: string };

export type JobAction = "pause" | "resume" | "retry";

export interface JobActionInput {
  jobId: string;
  action: JobAction;
}

export interface StartJobInput {
  resumeId: string;
}

export interface JobSSEEvent {
  status?: JobStatus;
  total?: number;
  sentCount?: number;
  failedCount?: number;
  reason?: string;
}
