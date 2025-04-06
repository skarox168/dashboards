import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionSelector } from "@/components/ui/permission-selector";
import { DatabaseSchemaViewer } from "@/components/database/database-schema-viewer";
import { Plus, Edit, Trash, Database as DatabaseIcon } from "lucide-react";
import { fine } from "@/lib/fine";
import { DatabaseConnection, Permission } from "@/types/dashboard";
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
import { Textarea } from "@/components/ui/textarea";
import { getDummyDatabaseSchema } from "@/lib/database-utils";

export default function DatabaseConnections() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<DatabaseConnection | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const fetchedConnections = await fine.table("databaseConnections").select();
        
        if (fetchedConnections) {
          const connectionsWithConfig = fetchedConnections.map((conn) => ({
            ...conn,
            config: JSON.parse(conn.config),
          }));
          
          setConnections(connectionsWithConfig);
        }
      } catch (error) {
        console.error("Error fetching database connections:", error);
        toast({
          title: "Error",
          description: "Failed to load database connections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, [toast]);

  const handleAddConnection = () => {
    setCurrentConnection({
      name: "",
      type: "mysql",
      config: {
        host: "",
        port: 3306,
        username: "",
        password: "",
        database: "",
      },
    });
    setPermissions([]);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditConnection = async (connection: DatabaseConnection) => {
    setCurrentConnection(connection);
    setIsEditing(true);
    
    try {
      // Fetch permissions for this connection
      const fetchedPermissions = await fine.table("databasePermissions")
        .select()
        .eq("databaseId", connection.id);
      
      if (fetchedPermissions) {
        setPermissions(
          fetchedPermissions.map((p) => ({
            entityId: p.entityId,
            entityType: p.entityType as 'user' | 'group',
            permission: p.permission as 'read' | 'write',
          }))
        );
      } else {
        setPermissions([]);
      }
      
      // For demo, we'll just use the dummy schema
      const dummySchema = await getDummyDatabaseSchema();
      setSchema(dummySchema);
      
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching connection details:", error);
      toast({
        title: "Error",
        description: "Failed to load connection details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConnection = (connection: DatabaseConnection) => {
    setCurrentConnection(connection);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentConnection?.id) return;
    
    try {
      await fine.table("databaseConnections").delete().eq("id", currentConnection.id);
      
      // Remove from state
      setConnections((prev) =>
        prev.filter((c) => c.id !== currentConnection.id)
      );
      
      toast({
        title: "Connection deleted",
        description: `"${currentConnection.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCurrentConnection(null);
    }
  };

  const handleSaveConnection = async (connection: DatabaseConnection) => {
    try {
      const connectionData = {
        name: connection.name,
        type: connection.type,
        config: JSON.stringify(connection.config),
      };
      
      let savedConnection;
      
      if (isEditing && connection.id) {
        // Update existing connection
        savedConnection = await fine.table("databaseConnections")
          .update(connectionData)
          .eq("id", connection.id)
          .select();
        
        if (!savedConnection || savedConnection.length === 0) {
          throw new Error("Failed to update connection");
        }
        
        // Delete existing permissions
        await fine.table("databasePermissions").delete().eq("databaseId", connection.id);
        
        // Save new permissions
        if (permissions.length > 0) {
          const dbPermissions = permissions.map((p) => ({
            databaseId: connection.id,
            entityType: p.entityType,
            entityId: p.entityId,
            permission: p.permission,
          }));
          
          await fine.table("databasePermissions").insert(dbPermissions);
        }
        
        // Update in state
        setConnections((prev) =>
          prev.map((c) =>
            c.id === connection.id
              ? { ...connection, config: connection.config }
              : c
          )
        );
        
        toast({
          title: "Connection updated",
          description: `"${connection.name}" has been updated successfully.`,
        });
      } else {
        // Create new connection
        savedConnection = await fine.table("databaseConnections").insert(connectionData).select();
        
        if (!savedConnection || savedConnection.length === 0) {
          throw new Error("Failed to create connection");
        }
        
        const newConnectionId = savedConnection[0].id;
        
        // Save permissions
        if (permissions.length > 0) {
          const dbPermissions = permissions.map((p) => ({
            databaseId: newConnectionId,
            entityType: p.entityType,
            entityId: p.entityId,
            permission: p.permission,
          }));
          
          await fine.table("databasePermissions").insert(dbPermissions);
        }
        
        // Add to state
        setConnections((prev) => [
          ...prev,
          { ...connection, id: newConnectionId, config: connection.config },
        ]);
        
        toast({
          title: "Connection created",
          description: `"${connection.name}" has been created successfully.`,
        });
      }
      
      setDialogOpen(false);
      setCurrentConnection(null);
    } catch (error) {
      console.error("Error saving connection:", error);
      toast({
        title: "Error",
        description: "Failed to save connection",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Database Connections</h1>
          <Button onClick={handleAddConnection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Connection
          </Button>
        </div>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 flex justify-end">
                  <Skeleton className="h-9 w-20 mr-2" />
                  <Skeleton className="h-9 w-9" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : connections.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No Connections</CardTitle>
              <CardDescription>
                You haven't added any database connections yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <DatabaseIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Connect to your databases to start creating dashboards
              </p>
              <Button onClick={handleAddConnection}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DatabaseIcon className="h-5 w-5 mr-2" />
                    {connection.name}
                  </CardTitle>
                  <CardDescription>
                    {connection.type.toUpperCase()} Database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {connection.type === "mysql" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Host:</span>
                          <span>{connection.config.host}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Database:</span>
                          <span>{connection.config.database}</span>
                        </div>
                      </>
                    )}
                    {connection.type === "dummy" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Demo Database</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditConnection(connection)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteConnection(connection)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Add dummy database card */}
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DatabaseIcon className="h-5 w-5 mr-2" />
                  Add Dummy Database
                </CardTitle>
                <CardDescription>
                  Create a test database for development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The dummy database contains sample data for testing your dashboards.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentConnection({
                      name: "Dummy Database",
                      type: "dummy",
                      config: {},
                    });
                    setPermissions([]);
                    setIsEditing(false);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Dummy Database
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      <ConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        connection={currentConnection}
        permissions={permissions}
        onPermissionsChange={setPermissions}
        onSave={handleSaveConnection}
        isEditing={isEditing}
        schema={schema}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the database connection "
              {currentConnection?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: DatabaseConnection | null;
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  onSave: (connection: DatabaseConnection) => void;
  isEditing: boolean;
  schema: any;
}

function ConnectionDialog({
  open,
  onOpenChange,
  connection,
  permissions,
  onPermissionsChange,
  onSave,
  isEditing,
  schema,
}: ConnectionDialogProps) {
  const [localConnection, setLocalConnection] = useState<DatabaseConnection | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (connection) {
      setLocalConnection({ ...connection });
    }
  }, [connection]);

  if (!localConnection) return null;

  const handleSave = () => {
    onSave(localConnection);
  };

  const updateConfig = (key: string, value: any) => {
    setLocalConnection((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        config: {
          ...prev.config,
          [key]: value,
        },
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Database Connection" : "Add Database Connection"}
          </DialogTitle>
          <DialogDescription>
            Configure your database connection details
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="schema" disabled={!isEditing}>
              Schema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input
                id="connection-name"
                value={localConnection.name}
                onChange={(e) =>
                  setLocalConnection((prev) => prev ? { ...prev, name: e.target.value } : null)
                }
                placeholder="My Database"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-type">Connection Type</Label>
              <Select
                value={localConnection.type}
                onValueChange={(value) =>
                  setLocalConnection((prev) => prev ? { ...prev, type: value } : null)
                }
              >
                <SelectTrigger id="connection-type">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mssql">SQL Server</SelectItem>
                  <SelectItem value="dummy">Dummy Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {localConnection.type !== "dummy" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="connection-host">Host</Label>
                  <Input
                    id="connection-host"
                    value={localConnection.config.host || ""}
                    onChange={(e) => updateConfig("host", e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-port">Port</Label>
                  <Input
                    id="connection-port"
                    type="number"
                    value={localConnection.config.port || ""}
                    onChange={(e) => updateConfig("port", parseInt(e.target.value))}
                    placeholder="3306"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-database">Database Name</Label>
                  <Input
                    id="connection-database"
                    value={localConnection.config.database || ""}
                    onChange={(e) => updateConfig("database", e.target.value)}
                    placeholder="my_database"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-username">Username</Label>
                  <Input
                    id="connection-username"
                    value={localConnection.config.username || ""}
                    onChange={(e) => updateConfig("username", e.target.value)}
                    placeholder="root"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-password">Password</Label>
                  <Input
                    id="connection-password"
                    type="password"
                    value={localConnection.config.password || ""}
                    onChange={(e) => updateConfig("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}
            
            {localConnection.type === "dummy" && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  The dummy database contains sample data for testing your dashboards.
                  No configuration is needed.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4 py-4">
            <div className="space-y-4">
              <Label>Database Access Permissions</Label>
              <p className="text-sm text-muted-foreground">
                Control which users and groups can access this database
              </p>
              <PermissionSelector
                permissions={permissions}
                onChange={onPermissionsChange}
                permissionType="read"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="schema" className="py-4">
            {schema ? (
              <DatabaseSchemaViewer schema={schema} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Schema information not available
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Update Connection" : "Add Connection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}