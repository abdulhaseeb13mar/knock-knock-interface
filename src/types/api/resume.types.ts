export interface ResumeUploadResponse {
  path: string;
}

export interface ResumeLink {
  id: string;
  sharedUrl: string;
  fileId: string;
  createdAt: string;
}

export interface SaveResumeLinkInput {
  sharedUrl: string;
}

export interface DeleteResumeLinkResponse {
  success: true;
}
