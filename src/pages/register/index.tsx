import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/hooks/api";
import { ApiError } from "@/services/api-client";
import { setToken } from "@/utils/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const registerMutation = useRegisterMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      const res = await registerMutation.mutateAsync({
        email,
        password,
      });
      setToken(res.accessToken);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]">
      <Card className="w-full max-w-sm shadow-2xl shadow-primary/10 border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Register</CardTitle>
          <CardDescription>Create a new Knock Knock account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <Button type="submit" className="w-full shadow-lg shadow-primary/25" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <><Spinner size="sm" className="mr-2" /> Creating account...</> : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
