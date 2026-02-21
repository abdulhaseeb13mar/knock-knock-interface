import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useGmailConnectMutation, useGmailRevokeMutation, useGmailStatusQuery } from "@/hooks/api";
import { ApiError } from "@/lib/api-client";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";

export default function GmailConnect() {
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const gmailConnectMutation = useGmailConnectMutation();
  const gmailRevokeMutation = useGmailRevokeMutation();
  const { data: gmailStatus, isLoading: statusLoading, refetch: refetchStatus } = useGmailStatusQuery();

  const isIntegrated = gmailStatus?.integrated ?? false;

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await gmailConnectMutation.mutateAsync();
      window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to connect Gmail");
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setRevokeLoading(true);
    try {
      await gmailRevokeMutation.mutateAsync();
      toast.success("Gmail access revoked");
      await refetchStatus();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to revoke Gmail access");
    } finally {
      setRevokeLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="size-5" />
        <h3 className="text-lg font-semibold">Gmail Integration</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {isIntegrated ? "Your Gmail account is connected." : "Connect your Gmail account to send emails through OAuth."}
      </p>
      {isIntegrated ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="size-5" />
            <span className="font-medium">Gmail integrated</span>
          </div>
          <Button variant="outline" onClick={handleRevoke} disabled={statusLoading || revokeLoading}>
            {revokeLoading ? "Revoking…" : "Revoke access"}
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={loading || statusLoading}>
          {loading ? "Connecting…" : "Connect Gmail"}
        </Button>
      )}
    </div>
  );
}
