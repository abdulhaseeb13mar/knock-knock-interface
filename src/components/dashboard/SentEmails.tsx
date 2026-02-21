import { Fragment, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSentEmailsQuery } from "@/hooks/api";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function SentEmails() {
  const { data: emails = [], isLoading: loading, isError } = useSentEmailsQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load sent emails");
    }
  }, [isError]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MailCheck className="size-5" />
        <h3 className="text-lg font-semibold">Sent Emails</h3>
        <Badge variant="outline">{emails.length}</Badge>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!loading && emails.length === 0 && <p className="text-sm text-muted-foreground">No emails sent yet. Start a job first.</p>}

      {emails.length > 0 && (
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
              {emails.map((e) => (
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
    </div>
  );
}
