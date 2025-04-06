import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash, Users, UserPlus, UserCircle } from "lucide-react";
import { fine } from "@/lib/fine";
import { UserGroup } from "@/types/dashboard";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserManagement() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<UserGroup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const fetchedGroups = await fine.table("userGroups").select();
        
        if (fetchedGroups) {
          setGroups(fetchedGroups);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
        toast({
          title: "Error",
          description: "Failed to load user groups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [toast]);

  const handleAddGroup = () => {
    setCurrentGroup({
      name: "",
      description: "",
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditGroup = (group: UserGroup) => {
    setCurrentGroup(group);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteGroup = (group: UserGroup) => {
    setCurrentGroup(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentGroup?.id) return;
    
    try {
      await fine.table("userGroups").delete().eq("id", currentGroup.id);
      
      // Remove from state
      setGroups((prev) =>
        prev.filter((g) => g.id !== currentGroup.id)
      );
      
      toast({
        title: "Group deleted",
        description: `"${currentGroup.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCurrentGroup(null);
    }
  };

  const handleSaveGroup = async (group: UserGroup) => {
    try {
      const groupData = {
        name: group.name,
        description: group.description || "",
      };
      
      let savedGroup;
      
      if (isEditing && group.id) {
        // Update existing group
        savedGroup = await fine.table("userGroups")
          .update(groupData)
          .eq("id", group.id)
          .select();
        
        if (!savedGroup || savedGroup.length === 0) {
          throw new Error("Failed to update group");
        }
        
        // Update in state
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...group }
              : g
          )
        );
        
        toast({
          title: "Group updated",
          description: `"${group.name}" has been updated successfully.`,
        });
      } else {
        // Create new group
        savedGroup = await fine.table("userGroups").insert(groupData).select();
        
        if (!savedGroup || savedGroup.length === 0) {
          throw new Error("Failed to create group");
        }
        
        const newGroupId = savedGroup[0].id;
        
        // Add to state
        setGroups((prev) => [
          ...prev,
          { ...group, id: newGroupId },
        ]);
        
        toast({
          title: "Group created",
          description: `"${group.name}" has been created successfully.`,
        });
      }
      
      setDialogOpen(false);
      setCurrentGroup(null);
    } catch (error) {
      console.error("Error saving group:", error);
      toast({
        title: "Error",
        description: "Failed to save group",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="groups">User Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Users</h2>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        <span>Admin User</span>
                      </TableCell>
                      <TableCell>admin@example.com</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        <span>John Doe</span>
                      </TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        <span>Jane Smith</span>
                      </TableCell>
                      <TableCell>jane@example.com</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t p-4 text-sm text-muted-foreground">
                Showing 3 of 3 users
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="groups" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Groups</h2>
              <Button onClick={handleAddGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
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
            ) : groups.length === 0 ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>No User Groups</CardTitle>
                  <CardDescription>
                    You haven't created any user groups yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground mb-4">
                    Create user groups to manage permissions more efficiently
                  </p>
                  <Button onClick={handleAddGroup}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {group.description || "No description provided"}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGroup(group)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={currentGroup}
        onSave={handleSaveGroup}
        isEditing={isEditing}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user group "
              {currentGroup?.name}". This action cannot be undone.
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

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserGroup | null;
  onSave: (group: UserGroup) => void;
  isEditing: boolean;
}

function GroupDialog({
  open,
  onOpenChange,
  group,
  onSave,
  isEditing,
}: GroupDialogProps) {
  const [localGroup, setLocalGroup] = useState<UserGroup | null>(null);

  useEffect(() => {
    if (group) {
      setLocalGroup({ ...group });
    }
  }, [group]);

  if (!localGroup) return null;

  const handleSave = () => {
    onSave(localGroup);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User Group" : "Add User Group"}
          </DialogTitle>
          <DialogDescription>
            Create and manage user groups for better permission control
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={localGroup.name}
              onChange={(e) =>
                setLocalGroup((prev) => prev ? { ...prev, name: e.target.value } : null)
              }
              placeholder="Marketing Team"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={localGroup.description || ""}
              onChange={(e) =>
                setLocalGroup((prev) => prev ? { ...prev, description: e.target.value } : null)
              }
              placeholder="A description of this user group"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Update Group" : "Add Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}