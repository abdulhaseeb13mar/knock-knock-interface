export type RecipientStatus = "PENDING" | "SENT" | "FAILED";

export interface CompanyEmail {
  id: string;
  email: string;
  companyName: string;
  description?: string;
  logo?: string;
  tags: string[];
}

/** An address-book entry. Send state per campaign lives on CampaignRecipient. */
export interface Recipient {
  id: string;
  companyEmailId: string;
  createdAt: string;
  companyEmail: CompanyEmail;
  campaignCount: number;
  sentCount: number;
  lastSentAt: string | null;
  latestStatus: RecipientStatus | null;
}

/** One recipient's participation in one campaign. */
export interface CampaignRecipient {
  id: string;
  recipientId: string;
  status: RecipientStatus;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
  companyEmail: CompanyEmail;
}

export interface ImportResponse {
  imported: number;
}
