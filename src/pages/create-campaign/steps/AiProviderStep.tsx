import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAiKeysQuery, useAiProvidersQuery, useSaveAiKeyMutation } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import type { AiProviderName } from "@/types/api";
import { Key } from "lucide-react";
import { toast } from "sonner";

interface AiProviderStepProps {
  selectedAiProvider: AiProviderName | null;
  onSelect: (provider: AiProviderName) => void;
}

export function AiProviderStep({ selectedAiProvider, onSelect }: AiProviderStepProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState<AiProviderName | "">("");
  const [newApiKey, setNewApiKey] = useState("");

  const { data: aiKeys = [], isLoading } = useAiKeysQuery();
  const { data: aiProviders = [] } = useAiProvidersQuery();
  const saveAiKeyMutation = useSaveAiKeyMutation();

  const addedProviders = new Set(aiKeys.map((k) => k.provider));
  const availableProviders = aiProviders.filter((p) => !addedProviders.has(p));

  async function handleAdd() {
    if (!newProvider || !newApiKey) return;
    try {
      await saveAiKeyMutation.mutateAsync({ provider: newProvider, apiKey: newApiKey });
      toast.success(`API key saved for ${newProvider}`);
      setNewApiKey("");
      setNewProvider("");
      setShowAdd(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save key");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="size-5" />
          Select AI Provider
        </CardTitle>
        <CardDescription>Choose which AI provider to use for generating emails. You must have a saved API key.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : aiKeys.length === 0 && !showAdd ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No AI keys configured. Add one to continue.</p>
            <Button variant="outline" onClick={() => setShowAdd(true)}>
              <Key className="size-4 mr-2" />
              Add API Key
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {aiKeys.map((key) => (
                <div
                  key={key.provider}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    selectedAiProvider === key.provider ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelect(key.provider)}
                >
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center ${selectedAiProvider === key.provider ? "border-primary" : "border-muted-foreground/30"}`}
                  >
                    {selectedAiProvider === key.provider && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold capitalize">{key.provider}</p>
                    <p className="text-xs text-muted-foreground">Priority: {key.priority}</p>
                  </div>
                </div>
              ))}
            </div>
            {!showAdd && availableProviders.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
                <Key className="size-4 mr-2" />
                Add New Key
              </Button>
            )}
          </>
        )}

        {showAdd && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={newProvider} onValueChange={(v) => setNewProvider(v as AiProviderName)} disabled={availableProviders.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={availableProviders.length === 0 ? "All providers configured" : "Select provider"} />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="sk-..." value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saveAiKeyMutation.isPending || !newProvider || !newApiKey}>
                {saveAiKeyMutation.isPending ? <Spinner size="sm" /> : "Save Key"}
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
