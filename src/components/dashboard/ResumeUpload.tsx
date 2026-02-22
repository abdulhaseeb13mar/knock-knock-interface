import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteResumeLinkMutation, useResumeLinksQuery, useSaveResumeLinkMutation } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import { FileText, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [sharedUrl, setSharedUrl] = useState("");
  const { data: resumes = [], isLoading } = useResumeLinksQuery();
  const saveResumeLinkMutation = useSaveResumeLinkMutation();
  const deleteResumeLinkMutation = useDeleteResumeLinkMutation();

  async function handleAddLink() {
    const trimmed = sharedUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a Google Drive link");
      return;
    }

    try {
      await saveResumeLinkMutation.mutateAsync({ sharedUrl: trimmed });
      setSharedUrl("");
      toast.success("Resume link saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save link");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteResumeLinkMutation.mutateAsync(id);
      toast.success("Resume link deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete link");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5" />
        <h3 className="text-lg font-semibold">Resume Links</h3>
      </div>
      <p className="text-sm text-muted-foreground">Save one or more public Google Drive links for your resumes.</p>

      <div className="flex gap-2 max-w-2xl">
        <Input type="url" placeholder="https://drive.google.com/file/d/..." value={sharedUrl} onChange={(e) => setSharedUrl(e.target.value)} />
        <Button onClick={handleAddLink} disabled={saveResumeLinkMutation.isPending}>
          <Link2 className="size-4 mr-1" />
          {saveResumeLinkMutation.isPending ? "Saving…" : "Save Link"}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading saved links…</p>}

      {!isLoading && resumes.length === 0 && <p className="text-sm text-muted-foreground">No resume links saved yet.</p>}

      {resumes.length > 0 && (
        <div className="space-y-2 max-w-3xl">
          {resumes.map((resume) => (
            <div key={resume.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0">
                <a href={resume.sharedUrl} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2 break-all">
                  {resume.sharedUrl}
                </a>
                <p className="text-xs text-muted-foreground">Added {new Date(resume.createdAt).toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDelete(resume.id)} disabled={deleteResumeLinkMutation.isPending}>
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
