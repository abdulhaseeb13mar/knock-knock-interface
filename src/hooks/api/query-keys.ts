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
  jobs: {
    list: ["jobs", "list"] as const,
    details: (jobId: string) => ["jobs", jobId, "details"] as const,
    status: (jobId: string) => ["jobs", jobId, "status"] as const,
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
