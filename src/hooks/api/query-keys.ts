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
    status: (jobId: string) => ["jobs", jobId, "status"] as const,
  },
  gmail: {
    status: ["gmail", "status"] as const,
  },
  resumes: {
    all: ["resumes"] as const,
  },
} as const;
