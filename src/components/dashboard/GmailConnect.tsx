import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api-client";
import type { GmailConnectResponse } from "@/lib/api-types";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function GmailConnect() {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await api.get<GmailConnectResponse>("/integrations/gmail/connect");
      window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to connect Gmail");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="size-5" />
        <h3 className="text-lg font-semibold">Gmail Integration</h3>
      </div>
      <p className="text-sm text-muted-foreground">Connect your Gmail account to send emails through OAuth.</p>
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? "Connecting…" : "Connect Gmail"}
      </Button>
    </div>
  );
}
