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
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b border-border/50 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <span className="font-bold text-xl tracking-tight">Knock Knock</span>
          <Button asChild className="shadow-sm shadow-primary/20">
            <Link to={authed ? "/dashboard" : "/login"}>{authed ? "Go to App" : "Get Started"}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Automate Your <span className="text-primary bg-none">Job Outreach</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Knock Knock helps you send AI-generated, personalized cold emails at scale. Connect your email, upload your resume, and start reaching out to
            companies.
          </p>
          <div className="flex items-center justify-center gap-4 pt-8">
            <Button size="lg" asChild className="shadow-lg shadow-primary/25 text-base px-8 h-12">
              <Link to={authed ? "/dashboard" : "/register"}>{authed ? "Open Dashboard" : "Create Free Account"}</Link>
            </Button>
            {!authed && (
              <Button size="lg" variant="outline" asChild className="text-base px-8 h-12 border-border/50 bg-background/50 hover:bg-white/5">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-primary/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative cursor-default">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 tracking-tight">Everything You Need for Cold Outreach</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 hover:border-primary/50 hover:bg-card transition-all duration-300"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8 p-12 rounded-3xl border border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to Start Knocking?</h2>
          <p className="text-lg text-muted-foreground">Set up in minutes. Connect your email, configure AI, and launch your first campaign.</p>
          <Button size="lg" asChild className="shadow-lg shadow-primary/25 text-base px-10 h-12">
            <Link to={authed ? "/dashboard" : "/register"}>{authed ? "Go to Dashboard" : "Get Started Free"}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 bg-background/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Knock Knock. All rights reserved.</div>
      </footer>
    </div>
  );
}
