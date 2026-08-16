import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface SettingsStepProps {
  dailyLimit: number;
  onChangeDailyLimit: (limit: number) => void;
  subject: string;
  onChangeSubject: (subject: string) => void;
  promptSetSubject: string | null;
}

export function SettingsStep({ dailyLimit, onChangeDailyLimit, subject, onChangeSubject, promptSetSubject }: SettingsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" />
          Campaign Settings
        </CardTitle>
        <CardDescription>Configure the subject line and how many emails to send per day.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-md space-y-5">
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="Hello from Knock Knock"
              value={subject}
              onChange={(e) => onChangeSubject(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {promptSetSubject
                ? "Pre-filled from the selected prompt set. Editing it here applies to this campaign only."
                : "Leave blank to use the default subject."}{" "}
              The AI rewrites this for each recipient, so every email gets its own variation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Daily Email Limit</Label>
            <Input
              id="dailyLimit"
              type="number"
              min={1}
              max={500}
              value={dailyLimit}
              onChange={(e) => onChangeDailyLimit(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="text-xs text-muted-foreground">Maximum number of emails to send per day during this campaign.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
