export interface EmailPromptSet {
  id: string;
  userId: string;
  emailFormat: string;
  aiPrompt: string;
  createdAt: string;
}

export interface CreateEmailPromptSetInput {
  emailFormat: string;
  aiPrompt: string;
}

export interface UpdateEmailPromptSetInput {
  emailFormat?: string;
  aiPrompt?: string;
}

export interface DeleteEmailPromptSetResponse {
  success: true;
}
