import type { SentEmail } from "./email.types";
import type { EmailPromptSet } from "./prompt.types";
import type { Recipient } from "./recipient.types";

export type CampaignStatus = "RUNNING" | "PAUSED" | "COMPLETED";

export interface EmailCampaign {
  id: string;
  userId: string;
  status: CampaignStatus;
  total: number;
  sentCount: number;
  failedCount: number;
  startedAt: string;
  completedAt?: string | null;
  pauseReason?: string | null;
}

export type StartCampaignResponse = EmailCampaign | { message: string };

export type CampaignAction = "pause" | "resume" | "retry";

export interface CampaignActionInput {
  campaignId: string;
  action: CampaignAction;
}

export interface StartCampaignInput {
  resumeId: string;
  promptSetId: string;
}

export interface CreateCampaignInput {
  resumeId: string;
  recipientIds: string[];
  aiProvider: string;
  promptSetId: string;
  dailyLimit: number;
}

export interface CampaignSSEEvent {
  status?: CampaignStatus;
  total?: number;
  sentCount?: number;
  failedCount?: number;
  reason?: string;
}

export interface CampaignDetailsResponse extends EmailCampaign {
  recipients: Recipient[];
  sentEmails: SentEmail[];
  emailPromptSet: EmailPromptSet | null;
}
