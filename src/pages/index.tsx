import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, LayoutDashboard, Plus, Users } from "lucide-react";
import { fine } from "@/lib/fine";
import { getAccessibleDashboards } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: session } = fine.auth.useSession();
  const [dashboardCount, setDashboardCount] = useState<number | null>(null);
  const [databaseCount, setDatabaseCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (session?.user) {
        setLoading(true);
        try {
          // Get accessible dashboards for the current user
          const accessibleDashboardIds = await getAccessibleDashboards(session.user.id);
          setDashboardCount(accessibleDashboardIds.length);
          
          // Get database connections count
          const databases = await fine.table("databaseConnections").select("id");
          setDatabaseCount(databases?.length || 0);
          
          // Get user count (in a real app, you'd use your auth system's API)
          setUserCount(3); // Dummy count for demo
        } catch (error) {
          console.error("Error fetching counts:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, [session]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {session?.user && (
            <Button asChild>
              <Link to="/dashboards/new">
                <Plus className="mr-2 h-4 w-4" />
                New Dashboard
              </Link>
            </Button>
          )}
        </div>
        
        {session?.user ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Dashboards"
                value={dashboardCount}
                description="Your accessible dashboards"
                icon={<LayoutDashboard className="h-6 w-6" />}
                loading={loading}
                linkTo="/dashboards"
              />
              <StatsCard
                title="Database Connections"
                value={databaseCount}
                description="Available data sources"
                icon={<Database className="h-6 w-6" />}
                loading={loading}
                linkTo="/admin/databases"
              />
              <StatsCard
                title="Dashboard Templates"
                value={2}
                description="Ready-to-use templates"
                icon={<BarChart3 className="h-6 w-6" />}
                loading={loading}
                linkTo="/templates"
              />
              <StatsCard
                title="Users"
                value={userCount}
                description="Registered platform users"
                icon={<Users className="h-6 w-6" />}
                loading={loading}
                linkTo="/admin/users"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Learn how to create your first dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Connect to your data sources</li>
                    <li>Create a new dashboard</li>
                    <li>Add widgets to visualize your data</li>
                    <li>Share your insights with your team</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboards/new">Create Your First Dashboard</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent dashboard activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No recent activity to display. Start by creating a new dashboard or exploring templates.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboards">View All Dashboards</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                  <CardDescription>Make the most of DataViz</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Use templates to get started quickly</li>
                    <li>Customize widgets to match your brand</li>
                    <li>Export dashboards to share with stakeholders</li>
                    <li>Set up user groups for better permission management</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/templates">Explore Templates</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Welcome to DataViz Dashboard</h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Create powerful, interactive dashboards to visualize your data and share insights with your team.
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: number | null;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  linkTo: string;
}

function StatsCard({ title, value, description, icon, loading, linkTo }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value !== null ? value : "-"}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-2">
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link to={linkTo}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Index;