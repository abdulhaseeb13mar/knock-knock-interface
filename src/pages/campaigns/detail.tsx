import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryKeys, useCampaignActionMutation, useCampaignDetailsQuery } from "@/hooks/api";
import { sseUrl } from "@/services/api-client";
import type { CampaignDetailsResponse, CampaignSSEEvent } from "@/types/api";
import { getToken } from "@/utils/auth";
import { formatDate } from "@/utils/format-date";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Clock, MailCheck, Pause, Play, RefreshCw, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";

export default function CampaignDetailPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const ctrlRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const campaignActionMutation = useCampaignActionMutation();
  const { data: campaign, refetch: refetchCampaignStatus, isLoading } = useCampaignDetailsQuery(campaignId, Boolean(campaignId));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const connectSSE = useCallback(
    (activeCampaignId: string) => {
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;

      fetchEventSource(sseUrl(`/campaigns/${activeCampaignId}/stream`), {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
        signal: ctrl.signal,
        onmessage(ev) {
          try {
            const data: CampaignSSEEvent = JSON.parse(ev.data);
            queryClient.setQueryData(queryKeys.campaigns.details(activeCampaignId), (prev: CampaignDetailsResponse | null | undefined) => {
              if (!prev) return prev ?? null;
              return {
                ...prev,
                ...(data.status != null ? { status: data.status } : {}),
                ...(data.total != null ? { total: data.total } : {}),
                ...(data.sentCount != null ? { sentCount: data.sentCount } : {}),
                ...(data.failedCount != null ? { failedCount: data.failedCount } : {}),
                ...(data.reason != null ? { pauseReason: data.reason } : {}),
                ...(data.status === "COMPLETED" ? { completedAt: new Date().toISOString() } : {}),
              };
            });
            if (data.status === "COMPLETED") {
              toast.success("Campaign completed");
              ctrl.abort();
            }
          } catch {
            // ignore non-JSON
          }
        },
        onerror() {
          ctrl.abort();
        },
        openWhenHidden: true,
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (campaign?.status === "RUNNING") {
      connectSSE(campaignId);
    }
    return () => {
      ctrlRef.current?.abort();
    };
  }, [campaign?.status, campaignId, connectSSE]);

  async function handleAction(action: "pause" | "resume" | "retry") {
    try {
      const res = await campaignActionMutation.mutateAsync({ campaignId, action });
      queryClient.setQueryData(queryKeys.campaigns.details(campaignId), (prev: CampaignDetailsResponse | undefined | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...res,
          pauseReason: action === "resume" || action === "retry" ? null : (res.pauseReason ?? null),
        };
      });
      if (action === "resume" || action === "retry") {
        connectSSE(campaignId);
      }
      toast.success(`Campaign ${action}d`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action}`);
    }
  }

  const progress = campaign && campaign.total > 0 ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.total) * 100) : 0;

  function statusColor(s: string) {
    if (s === "RUNNING") return "default" as const;
    if (s === "PAUSED") return "secondary" as const;
    return "outline" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/campaigns">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Detail</h1>
          <p className="text-xs font-mono text-muted-foreground">{campaignId}</p>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center p-8">
              <Spinner size="lg" />
            </div>
          </CardContent>
        </Card>
      )}

      {campaign && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Status</CardTitle>
                    <CardDescription>Real-time campaign execution progress</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(campaign.status)} className="text-sm px-3 py-1">
                      {campaign.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => refetchCampaignStatus()} title="Refresh status">
                      <RefreshCw className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>
                      {campaign.sentCount + campaign.failedCount} / {campaign.total} Processed
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex gap-4 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <MailCheck className="size-4" /> Sent: {campaign.sentCount}
                    </span>
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <AlertCircle className="size-4" /> Failed: {campaign.failedCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-4" /> Total: {campaign.total}
                    </span>
                  </div>
                </div>

                {campaign.pauseReason && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 rounded-md text-sm border border-yellow-200 dark:border-yellow-900">
                    <strong>Paused Reason:</strong> {campaign.pauseReason}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {campaign.status === "RUNNING" && (
                    <Button size="sm" onClick={() => handleAction("pause")}>
                      <Pause className="size-4 mr-2" /> Pause Campaign
                    </Button>
                  )}
                  {campaign.status === "PAUSED" && (
                    <Button size="sm" onClick={() => handleAction("resume")}>
                      <Play className="size-4 mr-2" /> Resume Campaign
                    </Button>
                  )}
                  {(campaign.status === "PAUSED" || campaign.status === "COMPLETED") && campaign.failedCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => handleAction("retry")}>
                      <RotateCcw className="size-4 mr-2" /> Retry Failed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Clock className="size-4" /> Started At
                  </div>
                  <div className="text-sm">{formatDate(campaign.startedAt)}</div>
                </div>
                {campaign.completedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                      <Clock className="size-4" /> Completed At
                    </div>
                    <div className="text-sm">{formatDate(campaign.completedAt)}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">Prompt Set</div>
                  <div className="text-sm">
                    {campaign.emailPromptSet ? (
                      <span className="font-medium">{campaign.emailPromptSet.emailFormat}</span>
                    ) : (
                      <span className="text-muted-foreground italic">None attached</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recipients" className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-2">
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="sent">Sent Emails</TabsTrigger>
            </TabsList>

            <TabsContent value="recipients" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    All Recipients
                    <Badge variant="outline">{campaign.recipients?.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!campaign.recipients || campaign.recipients.length === 0 ? (
                    <p className="text-sm flex justify-center py-10 text-muted-foreground">No recipients found.</p>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Error Info</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaign.recipients.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.companyEmail?.email}</TableCell>
                              <TableCell>{r.companyEmail?.companyName || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant={r.status === "SENT" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}>{r.status}</Badge>
                              </TableCell>
                              <TableCell>
                                {r.error && (
                                  <span className="text-xs text-red-600 dark:text-red-400 text-wrap line-clamp-2" title={r.error}>
                                    {r.error}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MailCheck className="size-5" />
                    Sent Emails
                    <Badge variant="outline">{campaign.sentEmails?.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!campaign.sentEmails || campaign.sentEmails.length === 0 ? (
                    <p className="text-sm flex justify-center py-10 text-muted-foreground">No emails have been successfully sent yet.</p>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Sent At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaign.sentEmails.map((e) => (
                            <Fragment key={e.id}>
                              <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                                <TableCell className="font-medium">{e.recipientEmail}</TableCell>
                                <TableCell className="max-w-75 truncate">{e.subject}</TableCell>
                                <TableCell className="text-xs">{formatDate(e.sentAt)}</TableCell>
                              </TableRow>
                              {expandedId === e.id && (
                                <TableRow>
                                  <TableCell colSpan={3} className="p-0 border-b">
                                    <div className="p-4 text-sm whitespace-pre-wrap bg-muted/10 font-mono text-muted-foreground border-l-4 border-l-primary">
                                      {e.body}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
