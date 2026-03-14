// ── Backend response types ──────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  knockBalance: string | number;
}

export interface GmailConnectResponse {
  url: string;
}

export type AiProviderName = "openai" | "anthropic" | "grok";

export interface AiKeyRecord {
  provider: AiProviderName;
  priority: number;
  createdAt: string;
}

export interface SaveKeyResponse {
  success: true;
}

export interface ImportResponse {
  imported: number;
}

export interface CompanyEmail {
  id: string;
  email: string;
  companyName: string;
  description?: string;
  logo?: string;
  tags: string[];
}

export type RecipientStatus = "PENDING" | "SENT" | "FAILED";

export interface Recipient {
  id: string;
  companyEmailId: string;
  status: RecipientStatus;
  error?: string | null;
  sentAt?: string | null;
  jobId?: string | null;
  createdAt: string;
  companyEmail: CompanyEmail;
}

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

export interface SentEmail {
  id: string;
  jobId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface ResumeUploadResponse {
  path: string;
}

export interface ResumeLink {
  id: string;
  sharedUrl: string;
  fileId: string;
  createdAt: string;
}

export interface SaveResumeLinkInput {
  sharedUrl: string;
}

export interface DeleteResumeLinkResponse {
  success: true;
}

export interface EmailPromptSet {
  id: string;
  userId: string;
  emailFormat: string;
  aiPrompt: string;
  createdAt: string;
}

export interface CreateEmailPromptSetInput {
  emailFormat: string;
  aiPrompt: string;
}

export interface UpdateEmailPromptSetInput {
  emailFormat?: string;
  aiPrompt?: string;
}

export interface DeleteEmailPromptSetResponse {
  success: true;
}

// SSE event payloads
export interface JobSSEEvent {
  status?: JobStatus;
  total?: number;
  sentCount?: number;
  failedCount?: number;
  reason?: string;
}
