import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useImportRecipientsMutation, useRecipientsQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { Check, Upload, Users } from "lucide-react";
import { toast } from "sonner";

interface RecipientsStepProps {
  selectedRecipientIds: string[];
  onToggle: (id: string) => void;
  onSetAll: (ids: string[]) => void;
}

export function RecipientsStep({ selectedRecipientIds, onToggle, onSetAll }: RecipientsStepProps) {
  const { data: recipients = [], isLoading } = useRecipientsQuery();
  const importRecipientsMutation = useImportRecipientsMutation();

  const pendingRecipients = recipients.filter((r) => r.status === "PENDING" && !r.campaignId);
  const allSelected = selectedRecipientIds.length === pendingRecipients.length && pendingRecipients.length > 0;

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

  function toggleAll() {
    onSetAll(allSelected ? [] : pendingRecipients.map((r) => r.id));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Select Recipients
            </CardTitle>
            <CardDescription>Choose which recipients to include in this campaign.</CardDescription>
          </div>
          <label>
            <Input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button asChild variant="outline" size="sm" disabled={importRecipientsMutation.isPending}>
              <span className="cursor-pointer">
                {importRecipientsMutation.isPending ? <Spinner size="sm" className="mr-2" /> : <Upload className="size-4 mr-2" />}
                {importRecipientsMutation.isPending ? "Importing..." : "Import CSV"}
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : pendingRecipients.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No available recipients. Import a CSV to add recipients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <Badge variant="secondary">
                {selectedRecipientIds.length} / {pendingRecipients.length} selected
              </Badge>
            </div>
            <div className="rounded-md border overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRecipients.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => onToggle(r.id)}>
                      <TableCell>
                        <div
                          className={`size-4 rounded border-2 flex items-center justify-center ${
                            selectedRecipientIds.includes(r.id) ? "border-primary bg-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {selectedRecipientIds.includes(r.id) && <Check className="size-3 text-primary-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{r.companyEmail.companyName}</TableCell>
                      <TableCell className="text-sm">{r.companyEmail.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
