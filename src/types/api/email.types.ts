export interface SentEmail {
  id: string;
  campaignId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}
