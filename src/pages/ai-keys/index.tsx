import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "../../components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiKeysQuery, useAiProvidersQuery, useDeleteAiKeyMutation, useSaveAiKeyMutation, useUpdateAiKeyPriorityMutation } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import type { AiKeyRecord, AiProviderName } from "@/types/api";
import { formatDate } from "@/utils/format-date";
import { ArrowDown, ArrowUp, Key } from "lucide-react";
import { toast } from "sonner";

export default function AiKeysPage() {
  const [provider, setProvider] = useState<AiProviderName | "">("");
  const [apiKey, setApiKey] = useState("");
  const [priorityDraft, setPriorityDraft] = useState<{
    baseSignature: string;
    providers: AiProviderName[];
  } | null>(null);
  const { data: providers = [] } = useAiProvidersQuery();
  const { data: savedKeys = [], isLoading: keysLoading } = useAiKeysQuery();
  const saveAiKeyMutation = useSaveAiKeyMutation();
  const deleteAiKeyMutation = useDeleteAiKeyMutation();
  const updateAiKeyPriorityMutation = useUpdateAiKeyPriorityMutation();
  const isSubmitting = saveAiKeyMutation.isPending;

  const addedProviders = new Set(savedKeys.map((key) => key.provider));
  const availableProviders = providers.filter((p) => !addedProviders.has(p));
  const selectedProvider = provider && availableProviders.includes(provider) ? provider : "";
  const savedKeysSignature = savedKeys.map((key) => `${key.provider}:${key.priority}:${key.createdAt}`).join("|");
  const activePriorityDraft = priorityDraft?.baseSignature === savedKeysSignature ? priorityDraft : null;

  const orderedKeys: AiKeyRecord[] = !activePriorityDraft
    ? savedKeys
    : activePriorityDraft.providers
        .map((providerName) => savedKeys.find((key) => key.provider === providerName))
        .filter((key): key is AiKeyRecord => Boolean(key));

  const hasOrderingChanges = orderedKeys.some((key, index) => key.provider !== savedKeys[index]?.provider);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProvider || !apiKey) return;
    try {
      await saveAiKeyMutation.mutateAsync({ provider: selectedProvider, apiKey });
      toast.success(`API key saved for ${selectedProvider}`);
      setApiKey("");
      setProvider("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save key");
    }
  }

  async function handleDeleteKey(keyProvider: AiProviderName) {
    const confirmed = window.confirm(`Delete ${keyProvider} API key?`);
    if (!confirmed) return;
    try {
      await deleteAiKeyMutation.mutateAsync(keyProvider);
      toast.success(`Deleted ${keyProvider} key`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete key");
    }
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const nextProviders = orderedKeys.map((key) => key.provider);
    [nextProviders[index - 1], nextProviders[index]] = [nextProviders[index], nextProviders[index - 1]];
    setPriorityDraft({ baseSignature: savedKeysSignature, providers: nextProviders });
  }

  function handleMoveDown(index: number) {
    if (index === orderedKeys.length - 1) return;
    const nextProviders = orderedKeys.map((key) => key.provider);
    [nextProviders[index + 1], nextProviders[index]] = [nextProviders[index], nextProviders[index + 1]];
    setPriorityDraft({ baseSignature: savedKeysSignature, providers: nextProviders });
  }

  function handleCancelPriority() {
    setPriorityDraft(null);
  }

  async function handleSavePriority() {
    try {
      const payload = {} as Record<AiProviderName, number>;
      orderedKeys.forEach((k, idx) => {
        payload[k.provider] = idx + 1;
      });
      await updateAiKeyPriorityMutation.mutateAsync(payload);
      setPriorityDraft(null);
      toast.success("Updated provider priority");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update priority");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Keys</h1>
        <p className="text-muted-foreground mt-1">Manage your AI provider API keys for email generation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Add API Key
          </CardTitle>
          <CardDescription>Add an API key for an AI provider. Keys are stored securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={(v) => setProvider(v as AiProviderName)} disabled={availableProviders.length === 0}>
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
              {availableProviders.length === 0 && <p className="text-xs text-muted-foreground">Every provider already has a saved key.</p>}
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
            </div>
            <Button type="submit" disabled={isSubmitting || !selectedProvider || !apiKey}>
              {isSubmitting ? "Saving…" : "Save Key"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stored API Keys</CardTitle>
              <CardDescription>Only provider and timestamp are kept for security.</CardDescription>
            </div>
            <Badge variant="outline">{keysLoading ? "Loading…" : `${savedKeys.length} ${savedKeys.length === 1 ? "key" : "keys"}`}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="flex justify-center p-8"><Spinner size="lg" /></div>
          ) : orderedKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keys yet. Save one to use AI features.</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {orderedKeys.map((key, index) => (
                  <div key={key.provider} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold capitalize">
                        {key.provider} {index === 0 && <span className="ml-1 text-xs font-normal text-amber-600">(Primary)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Added {formatDate(key.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {orderedKeys.length > 1 && (
                        <div className="flex flex-col gap-0.5 mr-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0 || updateAiKeyPriorityMutation.isPending}
                          >
                            <ArrowUp className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === orderedKeys.length - 1 || updateAiKeyPriorityMutation.isPending}
                          >
                            <ArrowDown className="size-3" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(key.provider)}
                        disabled={deleteAiKeyMutation.isPending || updateAiKeyPriorityMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {hasOrderingChanges && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelPriority} disabled={updateAiKeyPriorityMutation.isPending}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSavePriority} disabled={updateAiKeyPriorityMutation.isPending}>
                    {updateAiKeyPriorityMutation.isPending ? <><Spinner size="sm" className="mr-2" /> Saving...</> : "Save Priority"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
