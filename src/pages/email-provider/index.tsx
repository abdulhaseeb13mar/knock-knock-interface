import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGmailConnectMutation, useGmailRevokeMutation, useGmailStatusQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { AlertTriangle, Check, Mail } from "lucide-react";
import { toast } from "sonner";

export default function EmailProviderPage() {
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const gmailConnectMutation = useGmailConnectMutation();
  const gmailRevokeMutation = useGmailRevokeMutation();
  const { data: gmailStatus, isLoading: statusLoading, refetch: refetchStatus } = useGmailStatusQuery();

  const isIntegrated = gmailStatus?.integrated ?? false;
  const isGrantValid = gmailStatus?.grantValid ?? false;
  const isGrantExpired = isIntegrated && !isGrantValid;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Provider</h1>
        <p className="text-muted-foreground mt-1">Connect your email account to send outreach emails.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>
            {isGrantExpired
              ? "Your Gmail access has expired. Reconnect to resume sending emails."
              : isIntegrated
                ? "Your Gmail account is connected and ready to send emails."
                : "Connect your Gmail account to send emails through OAuth."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIntegrated ? (
            <div className="space-y-4">
              {isGrantExpired ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="size-5" />
                  <span className="font-medium">Gmail access expired</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="size-5" />
                  <span className="font-medium">Gmail integrated</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {isGrantExpired && (
                  <Button onClick={handleConnect} disabled={loading || statusLoading}>
                    {loading ? <Spinner size="sm" className="mr-2" /> : <Mail className="size-4 mr-2" />}
                    {loading ? "Redirecting…" : "Reconnect Gmail"}
                  </Button>
                )}
                <Button variant="outline" onClick={handleRevoke} disabled={statusLoading || revokeLoading}>
                  {revokeLoading ? "Revoking…" : "Revoke access"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleConnect} disabled={loading || statusLoading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : <Mail className="size-4 mr-2" /> }
              {loading ? "Connecting…" : "Connect Gmail"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
