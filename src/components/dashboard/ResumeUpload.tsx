import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumeUploadMutation } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const resumeUploadMutation = useResumeUploadMutation();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      e.target.value = "";
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await resumeUploadMutation.mutateAsync(fd);
      setUploadedPath(res.path);
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
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
        <Button asChild variant="outline" disabled={resumeUploadMutation.isPending}>
          <span className="cursor-pointer">
            <Upload className="size-4 mr-1" />
            {resumeUploadMutation.isPending ? "Uploading…" : "Upload PDF"}
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
