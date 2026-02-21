import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { queryKeys, useJobActionMutation, useJobStatusQuery, useStartJobMutation } from "@/hooks/api";
import { ApiError, sseUrl } from "@/lib/api-client";
import type { EmailJob, JobSSEEvent } from "@/lib/api-types";
import { getToken } from "@/lib/auth";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { Pause, Play, RefreshCw, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Jobs() {
  const [jobId, setJobId] = useState<string | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const startJobMutation = useStartJobMutation();
  const jobActionMutation = useJobActionMutation();
  const { data: job, refetch: refetchJobStatus } = useJobStatusQuery(jobId ?? "", Boolean(jobId));

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);

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
              toast.success("Job completed");
              ctrl.abort();
            }
          } catch {
            // ignore non-JSON
          }
        },
        onerror() {
          // Don't retry endlessly
          ctrl.abort();
        },
        openWhenHidden: true,
      });
    },
    [queryClient],
  );

  async function handleStart() {
    try {
      const res = await startJobMutation.mutateAsync();
      if ("message" in res) {
        toast.info(res.message);
      } else {
        setJobId(res.id);
        queryClient.setQueryData(queryKeys.jobs.status(res.id), { ...res, pauseReason: null });
        connectSSE(res.id);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start");
    }
  }

  async function handleAction(action: "pause" | "resume" | "retry", jobId: string) {
    try {
      const res = await jobActionMutation.mutateAsync({ jobId, action });
      queryClient.setQueryData(queryKeys.jobs.status(jobId), {
        ...res,
        pauseReason: action === "resume" || action === "retry" ? null : (res.pauseReason ?? null),
      });
      if (action === "resume" || action === "retry") {
        connectSSE(jobId);
      }
      toast.success(`Job ${action}d`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to ${action}`);
    }
  }

  async function handleRefreshStatus() {
    try {
      await refetchJobStatus();
    } catch {
      toast.error("Failed to refresh status");
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
      <div className="flex items-center gap-2">
        <Zap className="size-5" />
        <h3 className="text-lg font-semibold">Jobs</h3>
      </div>

      {!job && (
        <Button onClick={handleStart} disabled={startJobMutation.isPending}>
          <Play className="size-4 mr-1" />
          {startJobMutation.isPending ? "Starting…" : "Start Job"}
        </Button>
      )}

      {job && (
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={statusColor(job.status)}>{job.status}</Badge>
              <span className="text-xs font-mono text-muted-foreground">{job.id.slice(0, 8)}…</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleRefreshStatus} title="Refresh status">
              <RefreshCw className="size-4" />
            </Button>
          </div>

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
              <Button variant="outline" size="sm" onClick={() => handleAction("pause", job.id)}>
                <Pause className="size-4 mr-1" /> Pause
              </Button>
            )}
            {job.status === "PAUSED" && (
              <Button variant="outline" size="sm" onClick={() => handleAction("resume", job.id)}>
                <Play className="size-4 mr-1" /> Resume
              </Button>
            )}
            {(job.status === "PAUSED" || job.status === "COMPLETED") && job.failedCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => handleAction("retry", job.id)}>
                <RotateCcw className="size-4 mr-1" /> Retry Failed
              </Button>
            )}
            {job.status === "COMPLETED" && (
              <Button
                size="sm"
                onClick={() => {
                  ctrlRef.current?.abort();
                  setJobId(null);
                }}
              >
                <Play className="size-4 mr-1" /> New Job
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
