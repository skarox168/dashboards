import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { Edit, Download, Share, Star } from "lucide-react";
import { fine } from "@/lib/fine";
import { checkDashboardAccess } from "@/lib/permissions";
import { Dashboard, Widget } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardView() {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [dashboardVariables, setDashboardVariables] = useState<Record<string, string>>({});
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!id || !session?.user) return;
      
      setLoading(true);
      try {
        // Check if user has access to this dashboard
        const hasAccess = await checkDashboardAccess(session.user.id, parseInt(id));
        
        if (!hasAccess) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this dashboard",
            variant: "destructive",
          });
          navigate("/dashboards");
          return;
        }
        
        // Check if user can edit this dashboard
        const canEditDashboard = await checkDashboardAccess(
          session.user.id,
          parseInt(id),
          "edit"
        );
        setCanEdit(canEditDashboard);
        
        // Fetch dashboard
        const fetchedDashboard = await fine.table("dashboards")
          .select()
          .eq("id", parseInt(id))
          .limit(1);
        
        if (!fetchedDashboard || fetchedDashboard.length === 0) {
          toast({
            title: "Dashboard not found",
            description: "The requested dashboard could not be found",
            variant: "destructive",
          });
          navigate("/dashboards");
          return;
        }
        
        const dashboardData = fetchedDashboard[0];
        const parsedLayout = JSON.parse(dashboardData.layout);
        
        setDashboard({
          ...dashboardData,
          layout: parsedLayout,
        });
        
        setWidgets(parsedLayout.widgets || []);
        
        // Check if dashboard is in favorites
        const storedFavorites = localStorage.getItem(`favorites_${session.user.id}`);
        if (storedFavorites) {
          const favorites = JSON.parse(storedFavorites);
          setIsFavorite(favorites.some((fav: Dashboard) => fav.id === parseInt(id)));
        }
        
        // Extract dashboard variables
        if (parsedLayout.variables) {
          const initialVariables: Record<string, string> = {};
          parsedLayout.variables.forEach((variable: { name: string; defaultValue: string }) => {
            initialVariables[variable.name] = variable.defaultValue || '';
          });
          setDashboardVariables(initialVariables);
          
          // If there are variables, show the variable dialog
          if (Object.keys(initialVariables).length > 0) {
            setVariableDialogOpen(true);
          }
        }
        
        // Generate share link
        setShareLink(`${window.location.origin}/dashboards/${id}?shared=true`);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [id, session, toast, navigate]);

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    toast({
      title: "Export initiated",
      description: `Exporting dashboard as ${format.toUpperCase()}...`,
    });
    
    // In a real app, you would implement the actual export functionality here
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Dashboard exported as ${format.toUpperCase()} successfully.`,
      });
    }, 1500);
  };
  
  const toggleFavorite = () => {
    if (!dashboard || !session?.user) return;
    
    try {
      const storedFavorites = localStorage.getItem(`favorites_${session.user.id}`);
      let favorites: Dashboard[] = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter((fav) => fav.id !== dashboard.id);
        toast({
          title: "Removed from favorites",
          description: `"${dashboard.name}" has been removed from your favorites.`,
        });
      } else {
        // Add to favorites
        favorites.push({
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description,
          layout: { widgets: [] }, // Simplified layout for storage
          createdBy: dashboard.createdBy,
        });
        toast({
          title: "Added to favorites",
          description: `"${dashboard.name}" has been added to your favorites.`,
        });
      }
      
      localStorage.setItem(`favorites_${session.user.id}`, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };
  
  const handleVariableChange = (name: string, value: string) => {
    setDashboardVariables((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const applyVariables = () => {
    setVariableDialogOpen(false);
    
    // In a real app, you would update the widgets with the new variable values
    toast({
      title: "Variables applied",
      description: "Dashboard has been updated with the new variable values.",
    });
    
    // For demo purposes, let's simulate a refresh
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          {loading ? (
            <Skeleton className="h-10 w-1/3" />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {dashboard?.name || "Dashboard"}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFavorite}
              >
                <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                <span className="sr-only">
                  {isFavorite ? "Remove from favorites" : "Add to favorites"}
                </span>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {Object.keys(dashboardVariables).length > 0 && (
              <Button variant="outline" onClick={() => setVariableDialogOpen(true)}>
                Variables
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={() => setShareDialogOpen(true)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            
            {canEdit && (
              <Button asChild>
                <Link to={`/dashboards/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <Skeleton className="h-[600px] w-full" />
        ) : dashboard ? (
          <>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
            
            <div className="dashboard-container min-h-[600px]">
              <DashboardGrid widgets={widgets} isEditing={false} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Dashboard not found</p>
            <Button asChild>
              <Link to="/dashboards">Back to Dashboards</Link>
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogDescription>
              Share this dashboard with others using a unique link
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link" className="sr-only">
                Share Link
              </Label>
              <Input
                id="share-link"
                value={shareLink}
                readOnly
              />
            </div>
            <Button onClick={copyShareLink}>Copy</Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShareDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={variableDialogOpen} onOpenChange={setVariableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dashboard Variables</DialogTitle>
            <DialogDescription>
              Set values for dashboard variables to filter your data
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.entries(dashboardVariables).map(([name, value]) => (
              <div key={name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={name} className="text-right">
                  {name}
                </Label>
                <Input
                  id={name}
                  value={value}
                  onChange={(e) => handleVariableChange(name, e.target.value)}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={applyVariables}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}