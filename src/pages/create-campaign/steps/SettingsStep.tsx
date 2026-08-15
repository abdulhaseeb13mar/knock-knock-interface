import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface SettingsStepProps {
  dailyLimit: number;
  onChangeDailyLimit: (limit: number) => void;
}

export function SettingsStep({ dailyLimit, onChangeDailyLimit }: SettingsStepProps) {
  const [displayValue, setDisplayValue] = useState(String(dailyLimit));

  useEffect(() => {
    setDisplayValue(String(dailyLimit));
  }, [dailyLimit]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    if (!/^\d*$/.test(raw)) return;

    setDisplayValue(raw);

    if (raw !== "") {
      const parsed = parseInt(raw, 10);
      onChangeDailyLimit(Math.min(500, Math.max(1, parsed)));
    }
  }

  function handleBlur() {
    if (displayValue === "" || isNaN(parseInt(displayValue, 10))) {
      setDisplayValue("1");
      onChangeDailyLimit(1);
      return;
    }
    const clamped = Math.min(500, Math.max(1, parseInt(displayValue, 10)));
    setDisplayValue(String(clamped));
    onChangeDailyLimit(clamped);
  }

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
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p className="text-xs text-muted-foreground">Maximum number of emails to send per day during this campaign (1-500).</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}