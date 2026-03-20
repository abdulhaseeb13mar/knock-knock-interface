import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useResumeLinksQuery, useSaveResumeLinkMutation } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { FileText, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ResumeStepProps {
  selectedResumeId: string | null;
  onSelect: (id: string) => void;
}

export function ResumeStep({ selectedResumeId, onSelect }: ResumeStepProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const { data: resumes = [], isLoading } = useResumeLinksQuery();
  const saveResumeMutation = useSaveResumeLinkMutation();

  async function handleAdd() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    try {
      await saveResumeMutation.mutateAsync({ sharedUrl: trimmed });
      setNewUrl("");
      setShowAdd(false);
      toast.success("Resume link saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save link");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Select Resume
        </CardTitle>
        <CardDescription>Choose a resume to include with your campaign emails.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : resumes.length === 0 && !showAdd ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No resumes saved yet.</p>
            <Button variant="outline" onClick={() => setShowAdd(true)}>
              <Link2 className="size-4 mr-2" />
              Add Resume Link
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    selectedResumeId === resume.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelect(resume.id)}
                >
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center ${selectedResumeId === resume.id ? "border-primary" : "border-muted-foreground/30"}`}
                  >
                    {selectedResumeId === resume.id && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{resume.sharedUrl}</p>
                    <p className="text-xs text-muted-foreground">Added {new Date(resume.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {!showAdd && (
              <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
                <Link2 className="size-4 mr-2" />
                Add New Resume
              </Button>
            )}
          </>
        )}

        {showAdd && (
          <div className="border rounded-lg p-4 space-y-3">
            <Label>Google Drive Link</Label>
            <div className="flex gap-2">
              <Input type="url" placeholder="https://drive.google.com/file/d/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              <Button onClick={handleAdd} disabled={saveResumeMutation.isPending || !newUrl.trim()}>
                {saveResumeMutation.isPending ? <Spinner size="sm" /> : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
