import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface SettingsStepProps {
  dailyLimit: number;
  onChangeDailyLimit: (limit: number) => void;
}

export function SettingsStep({ dailyLimit, onChangeDailyLimit }: SettingsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" />
          Campaign Settings
        </CardTitle>
        <CardDescription>Configure how many emails to send per day.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-xs space-y-3">
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
