import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGmailConnectMutation, useGmailRevokeMutation, useGmailStatusQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";

export default function EmailProviderPage() {
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
            {isIntegrated ? "Your Gmail account is connected and ready to send emails." : "Connect your Gmail account to send emails through OAuth."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIntegrated ? (
            <div className="space-y-4">
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
              <Mail className="size-4 mr-2" />
              {loading ? "Connecting…" : "Connect Gmail"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
