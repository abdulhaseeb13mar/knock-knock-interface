import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, api } from "@/lib/api-client";
import type { ImportResponse, Recipient } from "@/lib/api-types";
import { Upload, Users } from "lucide-react";
import { toast } from "sonner";

export default function Recipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const fetchRecipients = useCallback(() => {
    setLoading(true);
    api
      .get<Recipient[]>("/recipients")
      .then(setRecipients)
      .catch(() => toast.error("Failed to load recipients"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<ImportResponse>("/recipients/import", fd);
      toast.success(`Imported ${res.imported} recipients`);
      fetchRecipients();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  function statusVariant(s: string) {
    if (s === "SENT") return "default" as const;
    if (s === "FAILED") return "destructive" as const;
    return "secondary" as const;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h3 className="text-lg font-semibold">Recipients</h3>
          <Badge variant="outline">{recipients.length}</Badge>
        </div>
        <label>
          <Input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button asChild variant="outline" disabled={importing}>
            <span className="cursor-pointer">
              <Upload className="size-4 mr-1" />
              {importing ? "Importing…" : "Import CSV"}
            </span>
          </Button>
        </label>
      </div>

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
    </div>
  );
}
