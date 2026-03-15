import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResumeLinksQuery, useStartJobMutation } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { useNavigate } from "@tanstack/react-router";
import { Play, Send } from "lucide-react";
import { toast } from "sonner";

export default function CampaignsPage() {
  const [resumeId, setResumeId] = useState<string>("");
  const navigate = useNavigate();
  const startJobMutation = useStartJobMutation();
  const { data: resumes = [], isLoading: resumesLoading } = useResumeLinksQuery();

  const activeResumeId = useMemo(() => {
    if (resumeId && resumes.some((r) => r.id === resumeId)) return resumeId;
    return resumes[0]?.id ?? "";
  }, [resumeId, resumes]);

  async function handleStart() {
    if (!activeResumeId) {
      toast.error("Select a resume link before starting");
      return;
    }

    try {
      const res = await startJobMutation.mutateAsync({ resumeId: activeResumeId });
      if ("message" in res) {
        toast.info(res.message);
      } else {
        toast.success("Campaign started!");
        navigate({ to: "/campaigns/$campaignId", params: { campaignId: res.id } });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start campaign");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground mt-1">Launch and manage your outreach campaigns.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5" />
            Start New Campaign
          </CardTitle>
          <CardDescription>Select a resume and start a new outreach campaign. Emails will be sent to all pending recipients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select resume to use</p>
            <Select value={activeResumeId} onValueChange={setResumeId}>
              <SelectTrigger>
                <SelectValue placeholder={resumesLoading ? "Loading resumes…" : "Select resume link"} />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.sharedUrl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleStart} disabled={startJobMutation.isPending || !activeResumeId}>
            {startJobMutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Play className="size-4 mr-2" /> }
            {startJobMutation.isPending ? "Starting..." : "Start Campaign"}
          </Button>

          {resumes.length === 0 && !resumesLoading && (
            <p className="text-sm text-muted-foreground">
              No resume links found. Add one in the{" "}
              <a href="/add-resume" className="underline text-primary">
                Add Resume
              </a>{" "}
              page first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
