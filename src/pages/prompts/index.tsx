import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useCreateEmailPromptSetMutation, useDeleteEmailPromptSetMutation, useEmailPromptSetsQuery, useUpdateEmailPromptSetMutation } from "@/hooks/api";
import type { EmailPromptSet } from "@/types/api";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PromptsPage() {
  const { data: promptSets, isLoading } = useEmailPromptSetsQuery();
  const createMutation = useCreateEmailPromptSetMutation();
  const updateMutation = useUpdateEmailPromptSetMutation();
  const deleteMutation = useDeleteEmailPromptSetMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailFormat, setEmailFormat] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setEmailFormat("");
    setAiPrompt("");
  };

  const handleEdit = (set: EmailPromptSet) => {
    setEditingId(set.id);
    let rawFormat = set.emailFormat;
    if (rawFormat.startsWith("`") && rawFormat.endsWith("`")) {
      rawFormat = rawFormat.slice(1, -1);
    }
    setEmailFormat(rawFormat);
    setAiPrompt(set.aiPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormat || !aiPrompt) {
      toast.error("Please fill in all fields");
      return;
    }

    const payloadEmailFormat = emailFormat.startsWith("`") && emailFormat.endsWith("`") ? emailFormat : `\`${emailFormat}\``;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          input: { emailFormat: payloadEmailFormat, aiPrompt },
        });
        toast.success("Prompt set updated");
      } else {
        await createMutation.mutateAsync({ emailFormat: payloadEmailFormat, aiPrompt });
        toast.success("Prompt set created");
      }
      resetForm();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to save prompt set");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt set?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Prompt set deleted");
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to delete prompt set");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prompts</h1>
        <p className="text-muted-foreground mt-1">Create and manage email prompt templates for AI generation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            {editingId ? "Edit Prompt Set" : "Create Prompt Set"}
          </CardTitle>
          <CardDescription>Configure how AI should format and generate your emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailFormat">Sample Email / Format</Label>
              <textarea
                id="emailFormat"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-60"
                placeholder="Paste an example email format here..."
                value={emailFormat}
                onChange={(e) => setEmailFormat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">AI Prompt Instruction</Label>
              <textarea
                id="aiPrompt"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-30"
                placeholder="Write a highly customized prompt for the AI to follow..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Saved Prompt Sets</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : promptSets?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prompt sets found. Create one above.</p>
        ) : (
          promptSets?.map((set) => {
            let displayFormat = set.emailFormat;
            if (displayFormat.startsWith("`") && displayFormat.endsWith("`")) {
              displayFormat = displayFormat.slice(1, -1);
            }
            if (displayFormat.length > 100) {
              displayFormat = displayFormat.slice(0, 100) + "...";
            }
            return (
              <Card key={set.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">Format: {displayFormat}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{set.aiPrompt}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(set)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(set.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
