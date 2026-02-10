import AiKeys from "@/components/dashboard/AiKeys";
import GmailConnect from "@/components/dashboard/GmailConnect";
import Jobs from "@/components/dashboard/Jobs";
import Recipients from "@/components/dashboard/Recipients";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import SentEmails from "@/components/dashboard/SentEmails";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { removeToken } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate({ to: "/login" });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knock Knock</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4 mr-1" /> Logout
        </Button>
      </div>
      <Separator />

      <Tabs defaultValue="gmail" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="gmail">Gmail</TabsTrigger>
          <TabsTrigger value="ai-keys">AI Keys</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="sent">Sent Emails</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="gmail">
            <GmailConnect />
          </TabsContent>
          <TabsContent value="ai-keys">
            <AiKeys />
          </TabsContent>
          <TabsContent value="recipients">
            <Recipients />
          </TabsContent>
          <TabsContent value="jobs">
            <Jobs />
          </TabsContent>
          <TabsContent value="sent">
            <SentEmails />
          </TabsContent>
          <TabsContent value="resume">
            <ResumeUpload />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
