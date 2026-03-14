import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useImportRecipientsMutation, useRecipientsQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { Upload, Users } from "lucide-react";
import { toast } from "sonner";

export default function RecipientsPage() {
  const { data: recipients = [], isLoading: loading, isError } = useRecipientsQuery();
  const importRecipientsMutation = useImportRecipientsMutation();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load recipients");
    }
  }, [isError]);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await importRecipientsMutation.mutateAsync(fd);
      toast.success(`Imported ${res.imported} recipients`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed");
    } finally {
      e.target.value = "";
    }
  }

  function statusVariant(s: string) {
    if (s === "SENT") return "default" as const;
    if (s === "FAILED") return "destructive" as const;
    return "secondary" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipients</h1>
          <p className="text-muted-foreground mt-1">Import and manage your outreach recipients.</p>
        </div>
        <label>
          <Input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button asChild variant="outline" disabled={importRecipientsMutation.isPending}>
            <span className="cursor-pointer">
              <Upload className="size-4 mr-2" />
              {importRecipientsMutation.isPending ? "Importing…" : "Import CSV"}
            </span>
          </Button>
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Recipients
            <Badge variant="outline">{recipients.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {!loading && recipients.length === 0 && <p className="text-sm text-muted-foreground">No recipients yet. Import a CSV to get started.</p>}

          {recipients.length > 0 && (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Job ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.companyEmail.companyName}</TableCell>
                      <TableCell>{r.companyEmail.email}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.error ?? "—"}</TableCell>
                      <TableCell className="text-xs">{r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{r.jobId ? r.jobId.slice(0, 8) + "…" : "—"}</TableCell>
                    </TableRow>
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
