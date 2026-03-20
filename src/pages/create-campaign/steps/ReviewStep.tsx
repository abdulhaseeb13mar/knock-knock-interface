import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiProviderName, EmailPromptSet, ResumeLink } from "@/types/api";
import { CheckCircle2 } from "lucide-react";

interface ReviewStepProps {
  resume: ResumeLink | undefined;
  selectedRecipientIds: string[];
  selectedAiProvider: AiProviderName | null;
  promptSet: EmailPromptSet | undefined;
  dailyLimit: number;
}

export function ReviewStep({ resume, selectedRecipientIds, selectedAiProvider, promptSet, dailyLimit }: ReviewStepProps) {
  const promptPreview = promptSet ? (promptSet.aiPrompt.length > 60 ? promptSet.aiPrompt.slice(0, 60) + "..." : promptSet.aiPrompt) : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          Review Campaign
        </CardTitle>
        <CardDescription>Review your campaign configuration before saving.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Resume</span>
              <span className="text-sm font-medium truncate max-w-xs">{resume?.sharedUrl ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Recipients</span>
              <Badge variant="secondary">{selectedRecipientIds.length} selected</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">AI Provider</span>
              <span className="text-sm font-medium capitalize">{selectedAiProvider ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Prompt Template</span>
              <span className="text-sm font-medium truncate max-w-xs">{promptPreview}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Daily Limit</span>
              <span className="text-sm font-medium">{dailyLimit} emails/day</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              The campaign will be created in <Badge variant="secondary">PAUSED</Badge> state. You can start it later from the campaigns list.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
