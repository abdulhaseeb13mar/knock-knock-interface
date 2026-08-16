import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGmailConnectMutation, useGmailStatusQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function GmailGrantWarning() {
  const [reconnecting, setReconnecting] = useState(false);
  const { data: gmailStatus } = useGmailStatusQuery();
  const gmailConnectMutation = useGmailConnectMutation();

  // Only warn when Gmail is connected but the grant went bad. A user who never
  // connected Gmail is handled by the normal onboarding flow, not an alarm.
  const grantExpired = Boolean(gmailStatus?.integrated) && !gmailStatus?.grantValid;

  if (!grantExpired) {
    return null;
  }

  async function handleReconnect() {
    setReconnecting(true);
    try {
      const res = await gmailConnectMutation.mutateAsync();
      window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start Gmail reconnect");
      setReconnecting(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Gmail access has expired</p>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
            Campaigns cannot send emails until you reconnect your Gmail account.
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleReconnect} disabled={reconnecting} className="shrink-0">
        {reconnecting ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Redirecting…
          </>
        ) : (
          "Reconnect Gmail"
        )}
      </Button>
    </div>
  );
}
