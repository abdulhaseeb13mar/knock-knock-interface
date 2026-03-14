import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiKeysQuery, useGmailStatusQuery, useResumeLinksQuery } from "@/hooks/api";
import { Link } from "@tanstack/react-router";
import { Check, FileText, Key, Mail, Send } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  useCompleted: () => boolean | undefined;
}

function StepCard({ step }: { step: OnboardingStep }) {
  const completed = step.useCompleted();

  return (
    <Card className={completed ? "border-green-200 bg-green-50/50" : undefined}>
      <CardContent className="flex items-start gap-4 p-6">
        <div
          className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${completed ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}
        >
          {completed ? <Check className="size-5" /> : step.icon}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{step.title}</h3>
            {completed && <span className="text-xs text-green-700 font-medium">Completed</span>}
          </div>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
        <Button variant={completed ? "outline" : "default"} size="sm" asChild>
          <Link to={step.href}>{completed ? "Manage" : "Set Up"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function useGmailCompleted() {
  const { data } = useGmailStatusQuery();
  return data?.integrated;
}

function useAiKeysCompleted() {
  const { data } = useAiKeysQuery();
  return data && data.length > 0 ? true : undefined;
}

function useResumeCompleted() {
  const { data } = useResumeLinksQuery();
  return data && data.length > 0 ? true : undefined;
}

const steps: OnboardingStep[] = [
  {
    title: "Connect Email Provider",
    description: "Link your Gmail account to send emails through secure OAuth integration.",
    href: "/email-provider",
    icon: <Mail className="size-5" />,
    useCompleted: useGmailCompleted,
  },
  {
    title: "Add AI Keys",
    description: "Configure at least one AI provider (OpenAI, Anthropic, or Grok) to generate personalized emails.",
    href: "/ai-keys",
    icon: <Key className="size-5" />,
    useCompleted: useAiKeysCompleted,
  },
  {
    title: "Upload Resume",
    description: "Add a Google Drive link to your resume so it can be shared with recipients.",
    href: "/add-resume",
    icon: <FileText className="size-5" />,
    useCompleted: useResumeCompleted,
  },
  {
    title: "Launch a Campaign",
    description: "Import recipients and start an automated outreach campaign.",
    href: "/campaigns",
    icon: <Send className="size-5" />,
    useCompleted: () => undefined,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Get Started</h1>
        <p className="text-muted-foreground mt-1">Complete the steps below to launch your first outreach campaign.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>Follow these steps in order to get up and running.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.href} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full border-2 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                {i < steps.length - 1 && <div className="w-px h-8 bg-border" />}
              </div>
              <div className="flex-1 pb-4">
                <StepCard step={step} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
