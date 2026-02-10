import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, api } from "@/lib/api-client";
import type { ResumeUploadResponse } from "@/lib/api-types";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<ResumeUploadResponse>("/users/resume", fd);
      setUploadedPath(res.path);
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5" />
        <h3 className="text-lg font-semibold">Resume Upload</h3>
      </div>
      <p className="text-sm text-muted-foreground">Upload your resume as a PDF. It will be used for email content generation.</p>

      <label>
        <Input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleUpload} />
        <Button asChild variant="outline" disabled={uploading}>
          <span className="cursor-pointer">
            <Upload className="size-4 mr-1" />
            {uploading ? "Uploading…" : "Upload PDF"}
          </span>
        </Button>
      </label>

      {uploadedPath && (
        <p className="text-sm text-muted-foreground">
          Uploaded: <code className="text-xs">{uploadedPath}</code>
        </p>
      )}
    </div>
  );
}
