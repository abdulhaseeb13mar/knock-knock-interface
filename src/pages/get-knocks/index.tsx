import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGrantTestingKnock } from "@/hooks/api/admin";
import { useMeQuery } from "@/hooks/api/users";
import { ApiError } from "@/services/api-client";
import { Coins } from "lucide-react";
import { toast } from "sonner";

export default function GetKnocksPage() {
  const grantTestingKnock = useGrantTestingKnock();
  const { data: me, isLoading: isMeLoading, refetch: refetchMe } = useMeQuery();

  const userId = me?.id;
  const knockBalance = me?.knockBalance;

  async function handleGetKnocks() {
    if (!userId || grantTestingKnock.isPending) return;

    try {
      await grantTestingKnock.mutateAsync({ userId });
      await refetchMe();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to grant knock");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Get Knocks</h1>
        <p className="text-muted-foreground mt-1">Manage your knock balance for sending outreach emails.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="size-5" />
            Knock Balance
          </CardTitle>
          <CardDescription>Use a testing grant to top up your knock balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm text-muted-foreground">Current knock balance</span>
            <Badge variant="outline" className="text-sm">
              {isMeLoading ? "Loading..." : knockBalance != null ? Number(knockBalance).toLocaleString() : "Unknown"}
            </Badge>
          </div>

          <Button onClick={handleGetKnocks} disabled={!userId || grantTestingKnock.isPending}>
            {grantTestingKnock.isPending ? "Granting..." : "Get More Knocks"}
          </Button>

          {!userId && <p className="text-sm text-destructive">Could not determine your user ID from the current session token.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
