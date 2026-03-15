import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "../../components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { queryKeys, useJobActionMutation, useJobStatusQuery, useSentEmailsQuery } from "@/hooks/api";
import { sseUrl } from "@/services/api-client";
import type { EmailJob, JobSSEEvent } from "@/types/api";
import { getToken } from "@/utils/auth";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MailCheck, Pause, Play, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function CampaignDetailPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const ctrlRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const jobActionMutation = useJobActionMutation();
  const { data: job, refetch: refetchJobStatus } = useJobStatusQuery(campaignId, Boolean(campaignId));
  const { data: emails = [], isLoading: emailsLoading } = useSentEmailsQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter sent emails for this campaign
  const campaignEmails = emails.filter((e) => e.jobId === campaignId);

  const connectSSE = useCallback(
    (jobId: string) => {
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;

      fetchEventSource(sseUrl(`/jobs/${jobId}/stream`), {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
        signal: ctrl.signal,
        onmessage(ev) {
          try {
            const data: JobSSEEvent = JSON.parse(ev.data);
            queryClient.setQueryData(queryKeys.jobs.status(jobId), (prev: EmailJob | null | undefined) => {
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

  // Connect SSE when job is running
  useEffect(() => {
    if (job?.status === "RUNNING") {
      connectSSE(campaignId);
    }
    return () => {
      ctrlRef.current?.abort();
    };
  }, [job?.status, campaignId, connectSSE]);

  async function handleAction(action: "pause" | "resume" | "retry") {
    try {
      const res = await jobActionMutation.mutateAsync({ jobId: campaignId, action });
      queryClient.setQueryData(queryKeys.jobs.status(campaignId), {
        ...res,
        pauseReason: action === "resume" || action === "retry" ? null : (res.pauseReason ?? null),
      });
      if (action === "resume" || action === "retry") {
        connectSSE(campaignId);
      }
      toast.success(`Campaign ${action}d`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action}`);
    }
  }

  const progress = job && job.total > 0 ? Math.round(((job.sentCount + job.failedCount) / job.total) * 100) : 0;

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

      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={statusColor(job.status)}>{job.status}</Badge>
                <Button variant="ghost" size="icon" onClick={() => refetchJobStatus()} title="Refresh status">
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>
                  {job.sentCount + job.failedCount} / {job.total}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Sent: {job.sentCount}</span>
                <span>Failed: {job.failedCount}</span>
              </div>
            </div>

            {job.pauseReason && <p className="text-sm text-yellow-600">Paused: {job.pauseReason}</p>}

            <div className="flex gap-2">
              {job.status === "RUNNING" && (
                <Button variant="outline" size="sm" onClick={() => handleAction("pause")}>
                  <Pause className="size-4 mr-1" /> Pause
                </Button>
              )}
              {job.status === "PAUSED" && (
                <Button variant="outline" size="sm" onClick={() => handleAction("resume")}>
                  <Play className="size-4 mr-1" /> Resume
                </Button>
              )}
              {(job.status === "PAUSED" || job.status === "COMPLETED") && job.failedCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => handleAction("retry")}>
                  <RotateCcw className="size-4 mr-1" /> Retry Failed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!job && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center p-8"><Spinner size="lg" /></div>
          </CardContent>
        </Card>
      )}

      {/* Sent Emails for this campaign */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="size-5" />
            Sent Emails
            <Badge variant="outline">{campaignEmails.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailsLoading && <div className="flex justify-center p-8"><Spinner size="lg" /></div>}

          {!emailsLoading && campaignEmails.length === 0 && <p className="text-sm text-muted-foreground">No emails sent yet for this campaign.</p>}

          {campaignEmails.length > 0 && (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignEmails.map((e) => (
                    <Fragment key={e.id}>
                      <TableRow className="cursor-pointer" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                        <TableCell>{e.recipientEmail}</TableCell>
                        <TableCell>{e.subject}</TableCell>
                        <TableCell className="text-xs">{new Date(e.sentAt).toLocaleString()}</TableCell>
                      </TableRow>
                      {expandedId === e.id && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30">
                            {e.body}
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
    </div>
  );
}
