export type RecipientStatus = "PENDING" | "SENT" | "FAILED";

export interface CompanyEmail {
  id: string;
  email: string;
  companyName: string;
  description?: string;
  logo?: string;
  tags: string[];
}

export interface Recipient {
  id: string;
  companyEmailId: string;
  status: RecipientStatus;
  error?: string | null;
  sentAt?: string | null;
  campaignId?: string | null;
  createdAt: string;
  companyEmail: CompanyEmail;
}

export interface ImportResponse {
  imported: number;
}
