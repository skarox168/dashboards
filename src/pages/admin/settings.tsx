import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    appName: "DataViz",
    appLogo: "",
    primaryColor: "#0066cc",
    enableDarkMode: true,
  });
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@dataviz.com",
    enableEmailNotifications: true,
  });
  const { toast } = useToast();

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === "enableDarkMode") {
      setGeneralSettings((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "enableEmailNotifications") {
      setEmailSettings((prev) => ({ ...prev, [name]: checked }));
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, we would save the settings to the database
      // For this demo, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Settings saved",
          description: "General settings have been saved successfully.",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, we would save the settings to the database
      // For this demo, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Settings saved",
          description: "Email settings have been saved successfully.",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <form onSubmit={handleSaveGeneral}>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure the general settings for your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      name="appName"
                      value={generalSettings.appName}
                      onChange={handleGeneralChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appLogo">Application Logo URL</Label>
                    <Input
                      id="appLogo"
                      name="appLogo"
                      value={generalSettings.appLogo}
                      onChange={handleGeneralChange}
                      disabled={isLoading}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the URL of your logo image
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={generalSettings.primaryColor}
                        onChange={handleGeneralChange}
                        disabled={isLoading}
                        className="w-16 h-10"
                      />
                      <Input
                        value={generalSettings.primaryColor}
                        onChange={handleGeneralChange}
                        name="primaryColor"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableDarkMode"
                      checked={generalSettings.enableDarkMode}
                      onCheckedChange={(checked) => handleSwitchChange("enableDarkMode", checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="enableDarkMode">Enable Dark Mode</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <Card>
              <form onSubmit={handleSaveEmail}>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>
                    Configure email settings for notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      name="smtpServer"
                      value={emailSettings.smtpServer}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      name="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      name="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      name="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      name="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableEmailNotifications"
                      checked={emailSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange("enableEmailNotifications", checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  View and download system logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-auto rounded border p-4 font-mono text-sm">
                  <p className="text-green-500">[2025-04-06 06:00:00] INFO: System started</p>
                  <p>[2025-04-06 06:01:12] INFO: User admin@example.com logged in</p>
                  <p>[2025-04-06 06:05:23] INFO: Dashboard "Sales Overview" created</p>
                  <p>[2025-04-06 06:10:45] INFO: Database connection "MySQL Production" added</p>
                  <p className="text-yellow-500">[2025-04-06 06:15:32] WARNING: High memory usage detected</p>
                  <p>[2025-04-06 06:20:18] INFO: User john@example.com logged in</p>
                  <p>[2025-04-06 06:25:41] INFO: Dashboard "Marketing Analytics" shared with group "Marketing Team"</p>
                  <p className="text-red-500">[2025-04-06 06:30:59] ERROR: Failed to connect to database "MySQL Production"</p>
                  <p>[2025-04-06 06:35:27] INFO: Database connection "MySQL Production" updated</p>
                  <p>[2025-04-06 06:40:14] INFO: User jane@example.com logged in</p>
                  <p>[2025-04-06 06:45:38] INFO: Dashboard "Customer Insights" created</p>
                  <p>[2025-04-06 06:50:22] INFO: User admin@example.com exported dashboard "Sales Overview" to PDF</p>
                  <p className="text-yellow-500">[2025-04-06 06:55:49] WARNING: API rate limit approaching</p>
                  <p>[2025-04-06 07:00:00] INFO: System backup completed successfully</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  Showing logs from April 6, 2025
                </div>
                <Button variant="outline">Download Logs</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Backup your data or restore from a previous backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a backup of your entire database including dashboards, connections, and user data.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeUserData" />
                    <Label htmlFor="includeUserData">Include user data</Label>
                  </div>
                  <Button>Create Backup</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Restore from Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore your system from a previous backup file.
                  </p>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="backupFile">Upload backup file</Label>
                    <Input id="backupFile" type="file" />
                  </div>
                  <Button variant="outline">Restore</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Scheduled Backups</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure automatic scheduled backups.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Switch id="enableScheduledBackups" />
                    <Label htmlFor="enableScheduledBackups">Enable scheduled backups</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frequency</Label>
                      <select
                        id="backupFrequency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionPeriod">Retention Period</Label>
                      <select
                        id="retentionPeriod"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                      </select>
                    </div>
                  </div>
                  <Button>Save Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}