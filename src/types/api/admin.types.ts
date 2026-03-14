export interface KnockConfig {
  emailsPerKnock: number;
}

export interface GrantTestingKnockResponse {
  userId: string;
  granted: number;
  knockBalance: number;
}
