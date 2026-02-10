import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ApiError, api, sseUrl } from "@/lib/api-client";
import type { EmailJob, JobSSEEvent, StartJobResponse } from "@/lib/api-types";
import { getToken } from "@/lib/auth";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Pause, Play, RefreshCw, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Jobs() {
  const [job, setJob] = useState<EmailJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      ctrlRef.current?.abort();
    };
  }, []);

  const connectSSE = useCallback((jobId: string) => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    fetchEventSource(sseUrl(`/jobs/${jobId}/stream`), {
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      signal: ctrl.signal,
      onmessage(ev) {
        try {
          const data: JobSSEEvent = JSON.parse(ev.data);
          setJob((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...(data.status != null ? { status: data.status } : {}),
              ...(data.total != null ? { total: data.total } : {}),
              ...(data.sentCount != null ? { sentCount: data.sentCount } : {}),
              ...(data.failedCount != null ? { failedCount: data.failedCount } : {}),
              ...(data.status === "COMPLETED" ? { completedAt: new Date().toISOString() } : {}),
            };
          });
          if (data.reason) setPauseReason(data.reason);
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
  }, []);

  async function handleStart() {
    setStarting(true);
    setPauseReason(null);
    try {
      const res = await api.post<StartJobResponse>("/jobs/start");
      if ("message" in res) {
        toast.info(res.message);
      } else {
        setJob(res);
        connectSSE(res.id);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start");
    } finally {
      setStarting(false);
    }
  }

  async function handleAction(action: "pause" | "resume" | "retry", jobId: string) {
    try {
      const res = await api.post<EmailJob>(`/jobs/${jobId}/${action}`);
      setJob(res);
      if (action === "resume" || action === "retry") {
        setPauseReason(null);
        connectSSE(jobId);
      }
      toast.success(`Job ${action}d`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to ${action}`);
    }
  }

  async function handleRefreshStatus(jobId: string) {
    try {
      const res = await api.get<EmailJob | null>(`/jobs/${jobId}/status`);
      if (res) setJob(res);
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
        <Button onClick={handleStart} disabled={starting}>
          <Play className="size-4 mr-1" />
          {starting ? "Starting…" : "Start Job"}
        </Button>
      )}

      {job && (
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={statusColor(job.status)}>{job.status}</Badge>
              <span className="text-xs font-mono text-muted-foreground">{job.id.slice(0, 8)}…</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => handleRefreshStatus(job.id)} title="Refresh status">
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

          {pauseReason && <p className="text-sm text-yellow-600">Paused: {pauseReason}</p>}

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
                  setJob(null);
                  setPauseReason(null);
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
