import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiKeysQuery, useAiProvidersQuery, useDeleteAiKeyMutation, useSaveAiKeyMutation } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import type { AiProviderName } from "@/lib/api-types";
import { Key } from "lucide-react";
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
  const { data: providers = [] } = useAiProvidersQuery();
  const { data: savedKeys = [], isLoading: keysLoading } = useAiKeysQuery();
  const saveAiKeyMutation = useSaveAiKeyMutation();
  const deleteAiKeyMutation = useDeleteAiKeyMutation();
  const isSubmitting = saveAiKeyMutation.isPending;

  const addedProviders = new Set(savedKeys.map((key) => key.provider));
  const availableProviders = providers.filter((provider) => !addedProviders.has(provider));

  useEffect(() => {
    if (provider && !availableProviders.includes(provider)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvider("");
    }
  }, [availableProviders, provider]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider || !apiKey) return;
    try {
      await saveAiKeyMutation.mutateAsync({ provider, apiKey });
      toast.success(`API key saved for ${provider}`);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Key className="size-5" />
        <h3 className="text-lg font-semibold">AI Keys</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={(v) => setProvider(v as AiProviderName)} disabled={availableProviders.length === 0}>
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
        <Button type="submit" disabled={isSubmitting || !provider || !apiKey}>
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
        ) : savedKeys.length === 0 ? (
          <p className="text-sm text-slate-500">No keys yet. Save one to use AI features.</p>
        ) : (
          <div className="space-y-2">
            {savedKeys.map((key) => (
              <div key={`${key.provider}-${key.createdAt}`} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-50">{key.provider}</p>
                    <p className="text-xs text-slate-400">Added {formatKeyDate(key.createdAt)}</p>
                  </div>
                  <Badge variant="ghost">{key.provider}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" size="xs" onClick={() => handleDeleteKey(key.provider)} disabled={deleteAiKeyMutation.isPending}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
