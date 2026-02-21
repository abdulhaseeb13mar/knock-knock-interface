import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiProvidersQuery, useSaveAiKeyMutation } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import type { AiProviderName } from "@/lib/api-types";
import { Key } from "lucide-react";
import { toast } from "sonner";

export default function AiKeys() {
  const [provider, setProvider] = useState<AiProviderName | "">("");
  const [apiKey, setApiKey] = useState("");
  const { data: providers = [] } = useAiProvidersQuery();
  const saveAiKeyMutation = useSaveAiKeyMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    try {
      await saveAiKeyMutation.mutateAsync({ provider, apiKey });
      toast.success(`API key saved for ${provider}`);
      setApiKey("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save key");
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
          <Select value={provider} onValueChange={(v) => setProvider(v as AiProviderName)}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input type="password" required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
        </div>
        <Button type="submit" disabled={saveAiKeyMutation.isPending || !provider}>
          {saveAiKeyMutation.isPending ? "Saving…" : "Save Key"}
        </Button>
      </form>
    </div>
  );
}
