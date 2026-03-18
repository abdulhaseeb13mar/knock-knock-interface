export const queryKeys = {
  ai: {
    providers: ["ai", "providers"] as const,
    keys: ["ai", "keys"] as const,
  },
  recipients: {
    all: ["recipients"] as const,
  },
  emails: {
    sent: ["emails", "sent"] as const,
  },
  campaigns: {
    list: ["campaigns", "list"] as const,
    details: (campaignId: string) => ["campaigns", campaignId, "details"] as const,
    status: (campaignId: string) => ["campaigns", campaignId, "status"] as const,
  },
  gmail: {
    status: ["gmail", "status"] as const,
  },
  resumes: {
    all: ["resumes"] as const,
  },
  emailPromptSets: {
    all: ["email-prompt-sets"] as const,
    detail: (id: string) => ["email-prompt-sets", id] as const,
  },
  users: {
    me: ["users", "me"] as const,
  },
} as const;
