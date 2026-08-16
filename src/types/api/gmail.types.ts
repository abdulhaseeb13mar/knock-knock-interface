export interface GmailConnectResponse {
  url: string;
}

export interface GmailStatusResponse {
  integrated: boolean;
  grantValid: boolean;
  reason: string | null;
}
