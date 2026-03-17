import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiKeysQuery, useEmailPromptSetsQuery, useGmailStatusQuery, useResumeLinksQuery } from "@/hooks/api";
import { Link } from "@tanstack/react-router";
import { Check, FileText, Key, Mail, MessageSquare, Send } from "lucide-react";

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
    <Card className={completed ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm shadow-emerald-500/5" : "bg-card shadow-sm border-border/50"}>
      <CardContent className="flex items-start gap-4 p-6">
        <div
          className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${completed ? "bg-emerald-500/20 text-emerald-400 shadow-inner shadow-emerald-500/20" : "bg-primary/10 text-primary shadow-inner shadow-primary/20"}`}
        >
          {completed ? <Check className="size-5" /> : step.icon}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground tracking-tight">{step.title}</h3>
            {completed && (
              <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Completed</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
        <Button
          variant={completed ? "outline" : "default"}
          size="sm"
          asChild
          className={completed ? "border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400" : ""}
        >
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

function usePromptsCompleted() {
  const { data } = useEmailPromptSetsQuery();
  return data && data.length > 0 ? true : undefined;
}

const steps: OnboardingStep[] = [
  {
    title: "Connect Gmail",
    description: "Link your Gmail account to send emails through secure OAuth integration.",
    href: "/email-provider",
    icon: <Mail className="size-5" />,
    useCompleted: useGmailCompleted,
  },
  {
    title: "Add Resume Link",
    description: "Add a Google Drive link to your resume so it can be shared with recipients.",
    href: "/add-resume",
    icon: <FileText className="size-5" />,
    useCompleted: useResumeCompleted,
  },
  {
    title: "Add AI Prompt",
    description: "Create email prompt templates to customize how AI generates personalized emails.",
    href: "/prompts",
    icon: <MessageSquare className="size-5" />,
    useCompleted: usePromptsCompleted,
  },
  {
    title: "Add AI Keys",
    description: "Configure at least one AI provider (OpenAI, Anthropic, or Grok) to generate personalized emails.",
    href: "/ai-keys",
    icon: <Key className="size-5" />,
    useCompleted: useAiKeysCompleted,
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

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>Follow these steps in order to get up and running.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.href} className="flex items-start gap-4 group">
              <div className="flex flex-col items-center mt-1">
                <div className="size-8 rounded-full border-2 border-primary/20 bg-background/50 flex items-center justify-center text-xs font-bold text-primary shadow-sm group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px h-full min-h-[3rem] bg-border/50 my-2" />}
              </div>
              <div className="flex-1 pb-6 w-full">
                <StepCard step={step} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
