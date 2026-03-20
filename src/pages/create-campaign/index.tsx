import { useState } from "react";

import { AiProviderStep } from "./steps/AiProviderStep";
import { PromptStep } from "./steps/PromptStep";
import { RecipientsStep } from "./steps/RecipientsStep";
import { ResumeStep } from "./steps/ResumeStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SettingsStep } from "./steps/SettingsStep";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateCampaignMutation, useEmailPromptSetsQuery, useResumeLinksQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import type { AiProviderName } from "@/types/api";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileText, Key, MessageSquare, Settings, Users } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { label: "Resume", icon: FileText },
  { label: "Recipients", icon: Users },
  { label: "AI Provider", icon: Key },
  { label: "Prompt", icon: MessageSquare },
  { label: "Settings", icon: Settings },
  { label: "Review", icon: CheckCircle2 },
] as const;

export default function CreateCampaignPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [selectedAiProvider, setSelectedAiProvider] = useState<AiProviderName | null>(null);
  const [selectedPromptSetId, setSelectedPromptSetId] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(50);

  const { data: resumes = [] } = useResumeLinksQuery();
  const { data: promptSets = [] } = useEmailPromptSetsQuery();
  const createCampaignMutation = useCreateCampaignMutation();

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const selectedPrompt = promptSets.find((p) => p.id === selectedPromptSetId);

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!selectedResumeId;
      case 1:
        return selectedRecipientIds.length > 0;
      case 2:
        return !!selectedAiProvider;
      case 3:
        return !!selectedPromptSetId;
      case 4:
        return dailyLimit > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function toggleRecipient(id: string) {
    setSelectedRecipientIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function handleCreate() {
    if (!selectedResumeId || !selectedAiProvider || !selectedPromptSetId) return;
    try {
      await createCampaignMutation.mutateAsync({
        resumeId: selectedResumeId,
        recipientIds: selectedRecipientIds,
        aiProvider: selectedAiProvider,
        promptSetId: selectedPromptSetId,
        dailyLimit,
      });
      toast.success("Campaign created successfully");
      navigate({ to: "/campaigns" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create campaign");
    }
  }

  const stepContent = [
    <ResumeStep selectedResumeId={selectedResumeId} onSelect={setSelectedResumeId} />,
    <RecipientsStep selectedRecipientIds={selectedRecipientIds} onToggle={toggleRecipient} onSetAll={setSelectedRecipientIds} />,
    <AiProviderStep selectedAiProvider={selectedAiProvider} onSelect={setSelectedAiProvider} />,
    <PromptStep selectedPromptSetId={selectedPromptSetId} onSelect={setSelectedPromptSetId} />,
    <SettingsStep dailyLimit={dailyLimit} onChangeDailyLimit={setDailyLimit} />,
    <ReviewStep
      resume={selectedResume}
      selectedRecipientIds={selectedRecipientIds}
      selectedAiProvider={selectedAiProvider}
      promptSet={selectedPrompt}
      dailyLimit={dailyLimit}
    />,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/campaigns" })}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground mt-1">Set up a new outreach campaign step by step.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isCompleted = i < step;
          return (
            <div key={s.label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                      : "text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1 hidden sm:block" />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {stepContent[step]}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="size-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={createCampaignMutation.isPending || !canProceed()}>
            {createCampaignMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
