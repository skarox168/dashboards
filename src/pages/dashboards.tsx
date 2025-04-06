import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Eye, MoreHorizontal, Plus, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fine } from "@/lib/fine";
import { getAccessibleDashboards, checkDashboardAccess } from "@/lib/permissions";
import { Dashboard } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [filteredDashboards, setFilteredDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchDashboards = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      try {
        // Get accessible dashboard IDs for the current user
        const accessibleDashboardIds = await getAccessibleDashboards(session.user.id);
        
        if (accessibleDashboardIds.length === 0) {
          setDashboards([]);
          setFilteredDashboards([]);
          setLoading(false);
          return;
        }
        
        // Fetch dashboard details
        const fetchedDashboards = await fine.table("dashboards")
          .select()
          .in("id", accessibleDashboardIds);
        
        if (!fetchedDashboards) {
          setDashboards([]);
          setFilteredDashboards([]);
          setLoading(false);
          return;
        }
        
        // Process dashboards and check edit permissions
        const dashboardsWithPermissions = await Promise.all(
          fetchedDashboards.map(async (dashboard) => {
            const canEdit = await checkDashboardAccess(
              session.user.id,
              dashboard.id as number,
              "edit"
            );
            
            return {
              ...dashboard,
              layout: JSON.parse(dashboard.layout),
              canEdit,
            };
          })
        );
        
        setDashboards(dashboardsWithPermissions);
        setFilteredDashboards(dashboardsWithPermissions);
      } catch (error) {
        console.error("Error fetching dashboards:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboards",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboards();
  }, [session, toast]);

  useEffect(() => {
    // Filter dashboards based on search query and active tab
    let filtered = [...dashboards];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (dashboard) =>
          dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dashboard.description &&
            dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (activeTab === "mine" && session?.user) {
      filtered = filtered.filter((dashboard) => dashboard.createdBy === session.user.id);
    } else if (activeTab === "shared") {
      filtered = filtered.filter(
        (dashboard) => dashboard.createdBy !== session?.user?.id
      );
    }
    
    setFilteredDashboards(filtered);
  }, [searchQuery, activeTab, dashboards, session]);

  const handleDeleteDashboard = async () => {
    if (!dashboardToDelete) return;
    
    try {
      await fine.table("dashboards").delete().eq("id", dashboardToDelete.id);
      
      // Remove from state
      setDashboards((prev) =>
        prev.filter((d) => d.id !== dashboardToDelete.id)
      );
      setFilteredDashboards((prev) =>
        prev.filter((d) => d.id !== dashboardToDelete.id)
      );
      
      toast({
        title: "Dashboard deleted",
        description: `"${dashboardToDelete.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to delete dashboard",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDashboardToDelete(null);
    }
  };

  const confirmDelete = (dashboard: Dashboard) => {
    setDashboardToDelete(dashboard);
    setDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
          <Button asChild>
            <Link to="/dashboards/new">
              <Plus className="mr-2 h-4 w-4" />
              New Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search dashboards..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Dashboards</TabsTrigger>
            <TabsTrigger value="mine">My Dashboards</TabsTrigger>
            <TabsTrigger value="shared">Shared With Me</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <DashboardGrid
              dashboards={filteredDashboards}
              loading={loading}
              onDelete={confirmDelete}
            />
          </TabsContent>
          <TabsContent value="mine" className="mt-4">
            <DashboardGrid
              dashboards={filteredDashboards}
              loading={loading}
              onDelete={confirmDelete}
            />
          </TabsContent>
          <TabsContent value="shared" className="mt-4">
            <DashboardGrid
              dashboards={filteredDashboards}
              loading={loading}
              onDelete={confirmDelete}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the dashboard "
              {dashboardToDelete?.name}" and all its widgets. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDashboard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

interface DashboardGridProps {
  dashboards: Dashboard[];
  loading: boolean;
  onDelete: (dashboard: Dashboard) => void;
}

function DashboardGrid({ dashboards, loading, onDelete }: DashboardGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No dashboards found</p>
        <Button asChild>
          <Link to="/dashboards/new">Create a Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Card key={dashboard.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{dashboard.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboards/${dashboard.id}`} className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  {dashboard.canEdit && (
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboards/${dashboard.id}/edit`} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {dashboard.canEdit && (
                    <DropdownMenuItem
                      onClick={() => onDelete(dashboard)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {dashboard.description || "No description provided"}
            </p>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Button asChild variant="outline" size="sm">
              <Link to={`/dashboards/${dashboard.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
            {dashboard.canEdit && (
              <Button asChild size="sm">
                <Link to={`/dashboards/${dashboard.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}