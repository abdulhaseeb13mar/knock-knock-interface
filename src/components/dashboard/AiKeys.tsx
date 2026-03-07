import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiKeysQuery, useAiProvidersQuery, useDeleteAiKeyMutation, useSaveAiKeyMutation, useUpdateAiKeyPriorityMutation } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import type { AiKeyRecord, AiProviderName } from "@/lib/api-types";
import { ArrowDown, ArrowUp, Key } from "lucide-react";
import { toast } from "sonner";

const keyDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatKeyDate(value: string) {
  return keyDateFormatter.format(new Date(value));
}

export default function AiKeys() {
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
  const availableProviders = providers.filter((provider) => !addedProviders.has(provider));
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
    setPriorityDraft({
      baseSignature: savedKeysSignature,
      providers: nextProviders,
    });
  }

  function handleMoveDown(index: number) {
    if (index === orderedKeys.length - 1) return;

    const nextProviders = orderedKeys.map((key) => key.provider);
    [nextProviders[index + 1], nextProviders[index]] = [nextProviders[index], nextProviders[index + 1]];
    setPriorityDraft({
      baseSignature: savedKeysSignature,
      providers: nextProviders,
    });
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Key className="size-5" />
        <h3 className="text-lg font-semibold">AI Keys</h3>
      </div>
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
          {availableProviders.length === 0 && <p className="text-xs text-slate-500">Every provider already has a saved key.</p>}
        </div>
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input type="password" required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
        </div>
        <Button type="submit" disabled={isSubmitting || !selectedProvider || !apiKey}>
          {isSubmitting ? "Saving…" : "Save Key"}
        </Button>
      </form>
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-50">Stored API keys</p>
            <p className="text-xs text-slate-400">Only provider and timestamp are kept for security.</p>
          </div>
          <Badge variant="outline">{keysLoading ? "Loading…" : `${savedKeys.length} ${savedKeys.length === 1 ? "key" : "keys"}`}</Badge>
        </div>
        {keysLoading ? (
          <p className="text-sm text-slate-400">Loading saved keys…</p>
        ) : orderedKeys.length === 0 ? (
          <p className="text-sm text-slate-500">No keys yet. Save one to use AI features.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {orderedKeys.map((key, index) => (
                <div key={`${key.provider}`} className="flex items-center gap-3 space-y-0 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize text-slate-50">
                          {key.provider} {index === 0 && <span className="ml-1 text-xs font-normal text-amber-500">(Primary)</span>}
                        </p>
                        <p className="text-xs text-slate-400">Added {formatKeyDate(key.createdAt)}</p>
                      </div>
                      <Badge variant="ghost">{key.provider}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-3">
                    {orderedKeys.length > 1 && (
                      <div className="flex flex-col gap-0.5 mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-slate-800"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || updateAiKeyPriorityMutation.isPending}
                        >
                          <ArrowUp className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-slate-800"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === orderedKeys.length - 1 || updateAiKeyPriorityMutation.isPending}
                        >
                          <ArrowDown className="size-3" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="xs"
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
                  {updateAiKeyPriorityMutation.isPending ? "Saving..." : "Save Priority"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
