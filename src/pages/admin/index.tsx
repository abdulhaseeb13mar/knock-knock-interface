import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGrantTestingKnock, useKnockConfig, useUpdateKnockConfig } from "@/hooks/api/admin";

export default function AdminPage() {
  const { data: config, isLoading: isConfigLoading } = useKnockConfig();
  const updateConfig = useUpdateKnockConfig();
  const grantKnock = useGrantTestingKnock();

  const [emailsPerKnock, setEmailsPerKnock] = useState<string>("1");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (config?.emailsPerKnock !== undefined) {
      setEmailsPerKnock(String(config.emailsPerKnock));
    }
  }, [config?.emailsPerKnock]);

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(emailsPerKnock, 10);
    if (!isNaN(val) && val > 0) {
      updateConfig.mutate({ emailsPerKnock: val });
    }
  };

  const handleGrantKnock = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      grantKnock.mutate({ userId: userId.trim() });
      setUserId("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage system configurations and users.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Configure global system settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {isConfigLoading ? (
              <p>Loading...</p>
            ) : (
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emails-per-knock">Emails per Knock</Label>
                  <Input id="emails-per-knock" type="number" min="1" value={emailsPerKnock} onChange={(e) => setEmailsPerKnock(e.target.value)} required />
                  <p className="text-sm text-muted-foreground">Number of emails generated/sent per 1 knock deducted.</p>
                </div>
                <Button type="submit" disabled={updateConfig.isPending}>
                  {updateConfig.isPending ? "Updating..." : "Update Config"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grant Knock Balance</CardTitle>
            <CardDescription>Grant testing knock balance to a specific user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrantKnock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input id="user-id" placeholder="Enter User ID (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)} required />
              </div>
              <Button type="submit" variant="secondary" disabled={grantKnock.isPending || !userId.trim()}>
                {grantKnock.isPending ? "Granting..." : "Grant 100 Knock"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
