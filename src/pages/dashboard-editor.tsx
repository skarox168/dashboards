import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PermissionSelector } from "@/components/ui/permission-selector";
import { Plus, Save, X, Trash } from "lucide-react";
import { fine } from "@/lib/fine";
import { checkDashboardAccess } from "@/lib/permissions";
import { Dashboard, Widget, WidgetType, Permission } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardVariable {
  name: string;
  defaultValue: string;
  description?: string;
}

// Update the Dashboard interface to include variables
interface ExtendedDashboard extends Dashboard {
  layout: {
    widgets: Widget[];
    variables?: DashboardVariable[];
  };
}

export default function DashboardEditor() {
  const { id } = useParams<{ id: string }>();
  const isNewDashboard = !id || id === "new";
  const [dashboard, setDashboard] = useState<ExtendedDashboard>({
    name: "",
    description: "",
    layout: { widgets: [], variables: [] },
    createdBy: "",
  });
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [variables, setVariables] = useState<DashboardVariable[]>([]);
  const [loading, setLoading] = useState(!isNewDashboard);
  const [saving, setSaving] = useState(false);
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [editWidgetDialogOpen, setEditWidgetDialogOpen] = useState(false);
  const [addVariableDialogOpen, setAddVariableDialogOpen] = useState(false);
  const [currentWidget, setCurrentWidget] = useState<Widget | null>(null);
  const [currentVariable, setCurrentVariable] = useState<DashboardVariable | null>(null);
  const [viewPermissions, setViewPermissions] = useState<Permission[]>([]);
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [availableDatabases, setAvailableDatabases] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (isNewDashboard || !session?.user) {
        // For new dashboard, initialize with current user as creator
        setDashboard((prev) => ({
          ...prev,
          createdBy: session?.user?.id || "",
        }));
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Check if user can edit this dashboard
        const canEdit = await checkDashboardAccess(
          session.user.id,
          parseInt(id!),
          "edit"
        );
        
        if (!canEdit) {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this dashboard",
            variant: "destructive",
          });
          navigate(`/dashboards/${id}`);
          return;
        }
        
        // Fetch dashboard
        const fetchedDashboard = await fine.table("dashboards")
          .select()
          .eq("id", parseInt(id!))
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
        setVariables(parsedLayout.variables || []);
        
        // Fetch permissions
        const dashboardPermissions = await fine.table("dashboardPermissions")
          .select()
          .eq("dashboardId", parseInt(id!));
        
        if (dashboardPermissions) {
          const viewPerms = dashboardPermissions.filter(p => p.permission === "view");
          const editPerms = dashboardPermissions.filter(p => p.permission === "edit");
          
          setViewPermissions(viewPerms.map(p => ({
            entityId: p.entityId,
            entityType: p.entityType as 'user' | 'group',
            permission: 'view'
          })));
          
          setEditPermissions(editPerms.map(p => ({
            entityId: p.entityId,
            entityType: p.entityType as 'user' | 'group',
            permission: 'edit'
          })));
        }
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
    
    // Fetch available databases
    const fetchDatabases = async () => {
      try {
        const databases = await fine.table("databaseConnections").select();
        if (databases) {
          setAvailableDatabases(databases);
        }
      } catch (error) {
        console.error("Error fetching databases:", error);
      }
    };
    
    fetchDatabases();
  }, [id, isNewDashboard, session, toast, navigate]);

  const handleSave = async () => {
    if (!session?.user) return;
    
    if (!dashboard.name.trim()) {
      toast({
        title: "Validation error",
        description: "Dashboard name is required",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const dashboardData = {
        name: dashboard.name,
        description: dashboard.description || "",
        layout: JSON.stringify({
          widgets: widgets,
          variables: variables,
        }),
        createdBy: dashboard.createdBy || session.user.id,
      };
      
      let savedDashboard;
      
      if (isNewDashboard) {
        // Create new dashboard
        savedDashboard = await fine.table("dashboards").insert(dashboardData).select();
        
        if (!savedDashboard || savedDashboard.length === 0) {
          throw new Error("Failed to create dashboard");
        }
        
        const newDashboardId = savedDashboard[0].id;
        
        // Save permissions
        const allPermissions = [
          ...viewPermissions.map(p => ({
            dashboardId: newDashboardId,
            entityType: p.entityType,
            entityId: p.entityId,
            permission: "view" as const
          })),
          ...editPermissions.map(p => ({
            dashboardId: newDashboardId,
            entityType: p.entityType,
            entityId: p.entityId,
            permission: "edit" as const
          }))
        ];
        
        if (allPermissions.length > 0) {
          await fine.table("dashboardPermissions").insert(allPermissions);
        }
        
        toast({
          title: "Dashboard created",
          description: "Your dashboard has been created successfully",
        });
        
        navigate(`/dashboards/${newDashboardId}`);
      } else {
        // Update existing dashboard
        savedDashboard = await fine.table("dashboards")
          .update(dashboardData)
          .eq("id", parseInt(id!))
          .select();
        
        if (!savedDashboard || savedDashboard.length === 0) {
          throw new Error("Failed to update dashboard");
        }
        
        // Delete existing permissions
        await fine.table("dashboardPermissions").delete().eq("dashboardId", parseInt(id!));
        
        // Save new permissions
        const allPermissions = [
          ...viewPermissions.map(p => ({
            dashboardId: parseInt(id!),
            entityType: p.entityType,
            entityId: p.entityId,
            permission: "view" as const
          })),
          ...editPermissions.map(p => ({
            dashboardId: parseInt(id!),
            entityType: p.entityType,
            entityId: p.entityId,
            permission: "edit" as const
          }))
        ];
        
        if (allPermissions.length > 0) {
          await fine.table("dashboardPermissions").insert(allPermissions);
        }
        
        toast({
          title: "Dashboard updated",
          description: "Your dashboard has been updated successfully",
        });
        
        navigate(`/dashboards/${id}`);
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to save dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLayoutChange = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
  };

  const handleAddWidget = () => {
    setCurrentWidget({
      id: uuidv4(),
      type: "bar",
      title: "New Widget",
      config: {},
      dataSource: {
        databaseId: "dummy",
        query: "SELECT * FROM dummyData",
      },
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 6,
        height: 4,
      },
    });
    setAddWidgetDialogOpen(true);
  };

  const handleEditWidget = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    if (widget) {
      setCurrentWidget({ ...widget });
      setEditWidgetDialogOpen(true);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleSaveWidget = (widget: Widget, isNew: boolean) => {
    if (isNew) {
      setWidgets((prev) => [...prev, widget]);
    } else {
      setWidgets((prev) =>
        prev.map((w) => (w.id === widget.id ? widget : w))
      );
    }
    setAddWidgetDialogOpen(false);
    setEditWidgetDialogOpen(false);
    setCurrentWidget(null);
  };
  
  const handleAddVariable = () => {
    setCurrentVariable({
      name: "",
      defaultValue: "",
      description: "",
    });
    setAddVariableDialogOpen(true);
  };
  
  const handleSaveVariable = (variable: DashboardVariable) => {
    const existingIndex = variables.findIndex(v => v.name === variable.name);
    
    if (existingIndex >= 0) {
      // Update existing variable
      setVariables(prev => 
        prev.map((v, i) => i === existingIndex ? variable : v)
      );
    } else {
      // Add new variable
      setVariables(prev => [...prev, variable]);
    }
    
    setAddVariableDialogOpen(false);
    setCurrentVariable(null);
  };
  
  const handleRemoveVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewDashboard ? "Create Dashboard" : "Edit Dashboard"}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(isNewDashboard ? "/dashboards" : `/dashboards/${id}`)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Dashboard"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : (
          <Tabs defaultValue="layout">
            <TabsList>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Layout</CardTitle>
                  <CardDescription>
                    Add and arrange widgets on your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={handleAddWidget}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Widget
                    </Button>
                  </div>
                  
                  <div className="dashboard-container min-h-[600px] border rounded-md">
                    {widgets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[600px]">
                        <p className="text-muted-foreground mb-4">
                          No widgets added yet
                        </p>
                        <Button onClick={handleAddWidget}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Widget
                        </Button>
                      </div>
                    ) : (
                      <DashboardGrid
                        widgets={widgets}
                        isEditing={true}
                        onLayoutChange={handleLayoutChange}
                        onWidgetRemove={handleRemoveWidget}
                        onWidgetEdit={handleEditWidget}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="variables" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Variables</CardTitle>
                  <CardDescription>
                    Define variables that can be used in widget queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={handleAddVariable}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variable
                    </Button>
                  </div>
                  
                  {variables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border rounded-md">
                      <p className="text-muted-foreground mb-4">
                        No variables defined yet
                      </p>
                      <Button onClick={handleAddVariable}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Variable
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variables.map((variable) => (
                        <div
                          key={variable.name}
                          className="flex items-center justify-between p-4 border rounded-md"
                        >
                          <div>
                            <h3 className="font-medium">{variable.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Default: {variable.defaultValue || "(empty)"}
                            </p>
                            {variable.description && (
                              <p className="text-sm text-muted-foreground">
                                {variable.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentVariable(variable);
                                setAddVariableDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveVariable(variable.name)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Configure your dashboard details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dashboard Name</Label>
                    <Input
                      id="name"
                      value={dashboard.name}
                      onChange={(e) =>
                        setDashboard((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter dashboard name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={dashboard.description || ""}
                      onChange={(e) =>
                        setDashboard((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter dashboard description"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Permissions</CardTitle>
                  <CardDescription>
                    Control who can view and edit this dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>View Permissions</Label>
                    <p className="text-sm text-muted-foreground">
                      Users and groups who can view this dashboard
                    </p>
                    <PermissionSelector
                      permissions={viewPermissions}
                      onChange={setViewPermissions}
                      permissionType="view"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Edit Permissions</Label>
                    <p className="text-sm text-muted-foreground">
                      Users and groups who can edit this dashboard
                    </p>
                    <PermissionSelector
                      permissions={editPermissions}
                      onChange={setEditPermissions}
                      permissionType="edit"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <WidgetDialog
        open={addWidgetDialogOpen}
        onOpenChange={setAddWidgetDialogOpen}
        widget={currentWidget}
        onSave={(widget) => handleSaveWidget(widget, true)}
        isNew={true}
        availableDatabases={availableDatabases}
        dashboardVariables={variables}
      />

      <WidgetDialog
        open={editWidgetDialogOpen}
        onOpenChange={setEditWidgetDialogOpen}
        widget={currentWidget}
        onSave={(widget) => handleSaveWidget(widget, false)}
        isNew={false}
        availableDatabases={availableDatabases}
        dashboardVariables={variables}
      />
      
      <VariableDialog
        open={addVariableDialogOpen}
        onOpenChange={setAddVariableDialogOpen}
        variable={currentVariable}
        onSave={handleSaveVariable}
        existingVariables={variables}
      />
    </DashboardLayout>
  );
}

interface WidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: Widget | null;
  onSave: (widget: Widget) => void;
  isNew: boolean;
  availableDatabases: any[];
  dashboardVariables: DashboardVariable[];
}

function WidgetDialog({ 
  open, 
  onOpenChange, 
  widget, 
  onSave, 
  isNew,
  availableDatabases,
  dashboardVariables
}: WidgetDialogProps) {
  const [localWidget, setLocalWidget] = useState<Widget | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("dummy");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("general");

  useEffect(() => {
    if (widget) {
      setLocalWidget({ ...widget });
      
      // Set database selection
      if (widget.dataSource && widget.dataSource.databaseId) {
        setSelectedDatabase(widget.dataSource.databaseId);
      }
      
      // Set query
      if (widget.dataSource && widget.dataSource.query) {
        setQuery(widget.dataSource.query);
      }
      
      // Reset active tab
      setActiveTab("general");
    }
  }, [widget]);

  if (!localWidget) return null;

  const handleSave = () => {
    // Update dataSource with selected database and query
    const updatedWidget = {
      ...localWidget,
      dataSource: {
        ...localWidget.dataSource,
        databaseId: selectedDatabase,
        query: localWidget.type === "text" ? "" : query,
      },
    };
    
    onSave(updatedWidget);
  };

  const widgetTypes: { value: WidgetType; label: string }[] = [
    { value: "pie", label: "Pie Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "table", label: "Data Table" },
    { value: "kpi", label: "KPI Card" },
    { value: "mindMap", label: "Mind Map" },
    { value: "flowChart", label: "Flow Chart" },
    { value: "scatter", label: "Scatter Plot" },
    { value: "gauge", label: "Gauge Chart" },
    { value: "groupedBar", label: "Grouped Bar Chart" },
    { value: "stackedBar", label: "Stacked Bar Chart" },
    { value: "dualAxis", label: "Dual Axis Chart" },
    { value: "text", label: "Text" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Widget" : "Edit Widget"}</DialogTitle>
          <DialogDescription>
            Configure your widget to visualize data
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data" disabled={localWidget.type === "text"}>Data Source</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                value={localWidget.title}
                onChange={(e) =>
                  setLocalWidget((prev) => prev ? { ...prev, title: e.target.value } : null)
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select
                value={localWidget.type}
                onValueChange={(value) =>
                  setLocalWidget((prev) => prev ? { ...prev, type: value as WidgetType } : null)
                }
              >
                <SelectTrigger id="widget-type">
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {localWidget.type === "text" && (
              <div className="space-y-2">
                <Label htmlFor="widget-content">Content</Label>
                <Textarea
                  id="widget-content"
                  value={(localWidget.config.content || "")}
                  onChange={(e) =>
                    setLocalWidget((prev) => prev ? {
                      ...prev,
                      config: { ...prev.config, content: e.target.value }
                    } : null)
                  }
                  rows={5}
                  placeholder="Enter text content here..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="widget-size">Widget Size</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="widget-width" className="text-xs">Width</Label>
                  <Select
                    value={localWidget.size.width.toString()}
                    onValueChange={(value) =>
                      setLocalWidget((prev) => prev ? {
                        ...prev,
                        size: { ...prev.size, width: parseInt(value) }
                      } : null)
                    }
                  >
                    <SelectTrigger id="widget-width">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 6, 8, 12].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="widget-height" className="text-xs">Height</Label>
                  <Select
                    value={localWidget.size.height.toString()}
                    onValueChange={(value) =>
                      setLocalWidget((prev) => prev ? {
                        ...prev,
                        size: { ...prev.size, height: parseInt(value) }
                      } : null)
                    }
                  >
                    <SelectTrigger id="widget-height">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 8].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Select
                value={selectedDatabase}
                onValueChange={setSelectedDatabase}
              >
                <SelectTrigger id="database">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dummy">Dummy Database</SelectItem>
                  {availableDatabases.map((db) => (
                    <SelectItem key={db.id} value={db.id.toString()}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={5}
                placeholder="SELECT * FROM table WHERE column = '${variable}'"
              />
              <p className="text-sm text-muted-foreground">
                Use ${'{variable}'} syntax to reference dashboard variables
              </p>
            </div>
            
            {dashboardVariables.length > 0 && (
              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {dashboardVariables.map((variable) => (
                    <Button
                      key={variable.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(prev => `${prev}\${${variable.name}}`)}
                    >
                      {variable.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isNew ? "Add Widget" : "Update Widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VariableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: DashboardVariable | null;
  onSave: (variable: DashboardVariable) => void;
  existingVariables: DashboardVariable[];
}

function VariableDialog({
  open,
  onOpenChange,
  variable,
  onSave,
  existingVariables,
}: VariableDialogProps) {
  const [localVariable, setLocalVariable] = useState<DashboardVariable | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (variable) {
      setLocalVariable({ ...variable });
      setNameError(null);
    }
  }, [variable]);

  if (!localVariable) return null;

  const handleSave = () => {
    // Validate name
    if (!localVariable.name.trim()) {
      setNameError("Variable name is required");
      return;
    }
    
    // Check for name conflicts (only for new variables)
    if (!variable?.name && existingVariables.some(v => v.name === localVariable.name)) {
      setNameError("A variable with this name already exists");
      return;
    }
    
    onSave(localVariable);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {variable?.name ? "Edit Variable" : "Add Variable"}
          </DialogTitle>
          <DialogDescription>
            Define a variable that can be used in widget queries
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="variable-name">Variable Name</Label>
            <Input
              id="variable-name"
              value={localVariable.name}
              onChange={(e) => {
                setLocalVariable((prev) => prev ? { ...prev, name: e.target.value } : null);
                setNameError(null);
              }}
              placeholder="customer_id"
              disabled={!!variable?.name} // Can't change name of existing variable
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            <p className="text-xs text-muted-foreground">
              Use this name to reference the variable in queries: ${'{variable_name}'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="variable-default">Default Value</Label>
            <Input
              id="variable-default"
              value={localVariable.defaultValue}
              onChange={(e) =>
                setLocalVariable((prev) => prev ? { ...prev, defaultValue: e.target.value } : null)
              }
              placeholder="Default value"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="variable-description">Description (Optional)</Label>
            <Textarea
              id="variable-description"
              value={localVariable.description || ""}
              onChange={(e) =>
                setLocalVariable((prev) => prev ? { ...prev, description: e.target.value } : null)
              }
              placeholder="Describe what this variable is used for"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {variable?.name ? "Update Variable" : "Add Variable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}