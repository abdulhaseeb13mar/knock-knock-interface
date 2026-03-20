import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateEmailPromptSetMutation, useEmailPromptSetsQuery } from "@/hooks/api";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface PromptStepProps {
  selectedPromptSetId: string | null;
  onSelect: (id: string) => void;
}

export function PromptStep({ selectedPromptSetId, onSelect }: PromptStepProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newEmailFormat, setNewEmailFormat] = useState("");
  const [newAiPrompt, setNewAiPrompt] = useState("");

  const { data: promptSets = [], isLoading } = useEmailPromptSetsQuery();
  const createPromptMutation = useCreateEmailPromptSetMutation();

  async function handleAdd() {
    if (!newEmailFormat || !newAiPrompt) {
      toast.error("Fill in both fields");
      return;
    }
    const payloadFormat = newEmailFormat.startsWith("`") && newEmailFormat.endsWith("`") ? newEmailFormat : `\`${newEmailFormat}\``;
    try {
      await createPromptMutation.mutateAsync({ emailFormat: payloadFormat, aiPrompt: newAiPrompt });
      toast.success("Prompt set created");
      setNewEmailFormat("");
      setNewAiPrompt("");
      setShowAdd(false);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "Failed to create prompt set");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5" />
          Configure Prompt
        </CardTitle>
        <CardDescription>Select an existing prompt template or create a new one.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : promptSets.length === 0 && !showAdd ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No prompt templates found. Create one to continue.</p>
            <Button variant="outline" onClick={() => setShowAdd(true)}>
              <MessageSquare className="size-4 mr-2" />
              Create Prompt
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {promptSets.map((set) => {
                let displayFormat = set.emailFormat;
                if (displayFormat.startsWith("`") && displayFormat.endsWith("`")) {
                  displayFormat = displayFormat.slice(1, -1);
                }
                if (displayFormat.length > 120) {
                  displayFormat = displayFormat.slice(0, 120) + "...";
                }
                return (
                  <div
                    key={set.id}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      selectedPromptSetId === set.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => onSelect(set.id)}
                  >
                    <div
                      className={`size-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${selectedPromptSetId === set.id ? "border-primary" : "border-muted-foreground/30"}`}
                    >
                      {selectedPromptSetId === set.id && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Format: {displayFormat}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{set.aiPrompt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {!showAdd && (
              <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
                <MessageSquare className="size-4 mr-2" />
                Create New Prompt
              </Button>
            )}
          </>
        )}

        {showAdd && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="space-y-2">
              <Label>Sample Email / Format</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-40"
                placeholder="Paste an example email format here..."
                value={newEmailFormat}
                onChange={(e) => setNewEmailFormat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>AI Prompt Instruction</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-24"
                placeholder="Write a highly customized prompt for the AI to follow..."
                value={newAiPrompt}
                onChange={(e) => setNewAiPrompt(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={createPromptMutation.isPending || !newEmailFormat || !newAiPrompt}>
                {createPromptMutation.isPending ? <Spinner size="sm" /> : "Create Prompt"}
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
