import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/utils/auth";
import { Link } from "@tanstack/react-router";
import { FileText, Key, Mail, Send, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: <Mail className="size-6" />,
    title: "Email Integration",
    description: "Connect your Gmail account with OAuth for secure, automated email delivery.",
  },
  {
    icon: <Key className="size-6" />,
    title: "AI-Powered Emails",
    description: "Use OpenAI, Anthropic, or Grok to generate highly personalized outreach emails.",
  },
  {
    icon: <FileText className="size-6" />,
    title: "Resume Attachment",
    description: "Link your Google Drive resume to be automatically included with every email.",
  },
  {
    icon: <Send className="size-6" />,
    title: "Campaign Management",
    description: "Run, pause, and retry email campaigns with real-time progress tracking.",
  },
  {
    icon: <Zap className="size-6" />,
    title: "Knock Balance",
    description: "Use knocks to send emails. Track your balance and request more when needed.",
  },
  {
    icon: <Shield className="size-6" />,
    title: "Prompt Templates",
    description: "Create reusable prompt templates to control how AI generates your emails.",
  },
];

export default function HomePage() {
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <span className="font-bold text-xl">Knock Knock</span>
          <Button asChild>
            <Link to={authed ? "/dashboard" : "/login"}>{authed ? "Go to App" : "Get Started"}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Automate Your Job Outreach</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Knock Knock helps you send AI-generated, personalized cold emails at scale. Connect your email, upload your resume, and start reaching out to
            companies.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to={authed ? "/dashboard" : "/register"}>{authed ? "Open Dashboard" : "Create Free Account"}</Link>
            </Button>
            {!authed && (
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Everything You Need for Cold Outreach</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-background p-6 space-y-3">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{feature.icon}</div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to Start Knocking?</h2>
          <p className="text-muted-foreground">Set up in minutes. Connect your email, configure AI, and launch your first campaign.</p>
          <Button size="lg" asChild>
            <Link to={authed ? "/dashboard" : "/register"}>{authed ? "Go to Dashboard" : "Get Started Free"}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Knock Knock. All rights reserved.</div>
      </footer>
    </div>
  );
}
