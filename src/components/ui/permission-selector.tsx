import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fine } from "@/lib/fine";
import { Permission, PermissionEntity } from "@/types/dashboard";

interface PermissionSelectorProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  permissionType: 'view' | 'edit' | 'read' | 'write';
}

export function PermissionSelector({ permissions, onChange, permissionType }: PermissionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<PermissionEntity[]>([]);
  const [groups, setGroups] = useState<PermissionEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch actual users from your auth system
        // For this demo, we'll create some dummy users
        const dummyUsers = [
          { id: "user1", name: "John Doe", type: "user" as const },
          { id: "user2", name: "Jane Smith", type: "user" as const },
          { id: "user3", name: "Bob Johnson", type: "user" as const },
        ];
        setUsers(dummyUsers);
        
        // Fetch user groups from the database
        const fetchedGroups = await fine.table("userGroups").select();
        if (fetchedGroups) {
          setGroups(
            fetchedGroups.map(group => ({
              id: group.id!.toString(),
              name: group.name,
              type: "group" as const
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching entities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntities();
  }, []);

  const entities = [...users, ...groups];
  
  const addPermission = (entity: PermissionEntity) => {
    // Check if permission already exists
    const exists = permissions.some(
      p => p.entityId === entity.id && p.entityType === entity.type
    );
    
    if (!exists) {
      const newPermission: Permission = {
        entityId: entity.id,
        entityType: entity.type,
        permission: permissionType
      };
      
      onChange([...permissions, newPermission]);
    }
    
    setOpen(false);
  };
  
  const removePermission = (permission: Permission) => {
    onChange(permissions.filter(
      p => !(p.entityId === permission.entityId && p.entityType === permission.entityType)
    ));
  };
  
  const getEntityName = (permission: Permission) => {
    const entity = entities.find(
      e => e.id === permission.entityId && e.type === permission.entityType
    );
    return entity?.name || permission.entityId;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {permissions.map((permission, index) => (
          <Badge key={`${permission.entityType}-${permission.entityId}-${index}`} variant="secondary">
            {getEntityName(permission)}
            <button
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removePermission(permission)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            <span>Add {permissionType} permission...</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users and groups..." />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Users">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`user-${user.id}`}
                  onSelect={() => addPermission(user)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      permissions.some(p => p.entityId === user.id && p.entityType === "user")
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Groups">
              {groups.map((group) => (
                <CommandItem
                  key={group.id}
                  value={`group-${group.id}`}
                  onSelect={() => addPermission(group)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      permissions.some(p => p.entityId === group.id && p.entityType === "group")
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {group.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}