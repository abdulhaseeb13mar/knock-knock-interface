export interface EmailPromptSet {
  id: string;
  userId: string;
  subject: string | null;
  emailFormat: string;
  aiPrompt: string;
  createdAt: string;
}

export interface CreateEmailPromptSetInput {
  subject?: string;
  emailFormat: string;
  aiPrompt: string;
}

export interface UpdateEmailPromptSetInput {
  subject?: string;
  emailFormat?: string;
  aiPrompt?: string;
}

export interface DeleteEmailPromptSetResponse {
  success: true;
}
