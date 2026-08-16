import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useImportRecipientsMutation, useRecipientsQuery } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { Check, Search, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";

interface RecipientsStepProps {
  selectedRecipientIds: string[];
  onToggle: (id: string) => void;
  onSetAll: (ids: string[]) => void;
}

export function RecipientsStep({ selectedRecipientIds, onToggle, onSetAll }: RecipientsStepProps) {
  const [search, setSearch] = useState("");
  const { data: recipients = [], isLoading } = useRecipientsQuery();
  const importRecipientsMutation = useImportRecipientsMutation();

  // A recipient can belong to any number of campaigns, so none are excluded
  const pendingRecipients = recipients;

  const visibleRecipients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pendingRecipients;
    return pendingRecipients.filter(
      (r) => r.companyEmail.email.toLowerCase().includes(term) || (r.companyEmail.companyName ?? "").toLowerCase().includes(term),
    );
  }, [pendingRecipients, search]);

  const selectedIdSet = new Set(selectedRecipientIds);
  const allVisibleSelected = visibleRecipients.length > 0 && visibleRecipients.every((r) => selectedIdSet.has(r.id));
  const isFiltering = search.trim().length > 0;

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

  // Scoped to what is currently visible so a search never clears selections
  // the user made under a different search term.
  function toggleAll() {
    const visibleIds = visibleRecipients.map((r) => r.id);
    if (allVisibleSelected) {
      const visibleIdSet = new Set(visibleIds);
      onSetAll(selectedRecipientIds.filter((id) => !visibleIdSet.has(id)));
      return;
    }
    onSetAll(Array.from(new Set([...selectedRecipientIds, ...visibleIds])));
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
            <p className="text-sm text-muted-foreground">No recipients yet. Import a CSV to add recipients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {isFiltering && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={toggleAll} disabled={visibleRecipients.length === 0}>
                {allVisibleSelected ? (isFiltering ? "Deselect Matches" : "Deselect All") : isFiltering ? "Select Matches" : "Select All"}
              </Button>
              <div className="flex items-center gap-2">
                {isFiltering && (
                  <span className="text-xs text-muted-foreground">
                    {visibleRecipients.length} of {pendingRecipients.length} shown
                  </span>
                )}
                <Badge variant="secondary">
                  {selectedRecipientIds.length} / {pendingRecipients.length} selected
                </Badge>
              </div>
            </div>
            {visibleRecipients.length === 0 ? (
              <p className="rounded-md border py-6 text-center text-sm text-muted-foreground">No recipients match "{search.trim()}".</p>
            ) : (
            <div className="rounded-md border overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRecipients.map((r) => (
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
                      <TableCell className="text-xs text-muted-foreground">
                        {r.campaignCount === 0
                          ? "Never contacted"
                          : `${r.campaignCount} campaign${r.campaignCount === 1 ? "" : "s"}, ${r.sentCount} sent`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
