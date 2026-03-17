import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useJobsQuery } from "@/hooks/api/jobs";
import { formatDate } from "@/utils/format-date";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Send } from "lucide-react";

export default function CampaignsPage() {
  const navigate = useNavigate({ from: "/campaigns" });
  const { data: jobs = [], isLoading } = useJobsQuery();

  function statusColor(s: string) {
    if (s === "RUNNING") return "default" as const;
    if (s === "PAUSED") return "secondary" as const;
    return "outline" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and track your outreach campaigns.</p>
        </div>
        <Button disabled>
          <Plus className="size-4 mr-2" />
          Create new campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5" />
            Your Campaigns
          </CardTitle>
          <CardDescription>View all your recent and past outreach campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No campaigns found.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Campaign ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const progress = job.total > 0 ? Math.round(((job.sentCount + job.failedCount) / job.total) * 100) : 0;

                    return (
                      <TableRow
                        key={job.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate({ to: "/campaigns/$campaignId", params: { campaignId: job.id } })}
                      >
                        <TableCell className="font-mono text-xs">{job.id}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {job.sentCount} / {job.total}
                            </span>
                            <span className="text-xs text-muted-foreground">({progress}%)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(job.startedAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
