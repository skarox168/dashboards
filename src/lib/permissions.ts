import { fine } from "./fine";

export type EntityType = 'user' | 'group';
export type Permission = 'view' | 'edit' | 'read' | 'write';

export async function getUserGroups(userId: string) {
  const userGroupMembers = await fine.table("userGroupMembers").select().eq("userId", userId);
  if (!userGroupMembers || userGroupMembers.length === 0) return [];
  
  const groupIds = userGroupMembers.map(member => member.groupId);
  const groups = await fine.table("userGroups").select().in("id", groupIds);
  
  return groups || [];
}

export async function checkDatabaseAccess(userId: string, databaseId: number): Promise<boolean> {
  // Check direct user permissions
  const userPermissions = await fine.table("databasePermissions")
    .select()
    .eq("databaseId", databaseId)
    .eq("entityType", "user")
    .eq("entityId", userId);
  
  if (userPermissions && userPermissions.length > 0) {
    return true;
  }
  
  // Check group permissions
  const userGroups = await getUserGroups(userId);
  if (userGroups.length > 0) {
    const groupIds = userGroups.map(group => group.id);
    const groupPermissions = await fine.table("databasePermissions")
      .select()
      .eq("databaseId", databaseId)
      .eq("entityType", "group")
      .in("entityId", groupIds.map(id => id.toString()));
    
    if (groupPermissions && groupPermissions.length > 0) {
      return true;
    }
  }
  
  return false;
}

export async function checkDashboardAccess(userId: string, dashboardId: number, requiredPermission: Permission = 'view'): Promise<boolean> {
  // Check direct user permissions
  const userPermissions = await fine.table("dashboardPermissions")
    .select()
    .eq("dashboardId", dashboardId)
    .eq("entityType", "user")
    .eq("entityId", userId);
  
  if (userPermissions && userPermissions.length > 0) {
    const hasPermission = userPermissions.some(p => {
      if (requiredPermission === 'view') return true; // 'edit' permission implies 'view'
      return p.permission === requiredPermission;
    });
    
    if (hasPermission) return true;
  }
  
  // Check group permissions
  const userGroups = await getUserGroups(userId);
  if (userGroups.length > 0) {
    const groupIds = userGroups.map(group => group.id);
    const groupPermissions = await fine.table("dashboardPermissions")
      .select()
      .eq("dashboardId", dashboardId)
      .eq("entityType", "group")
      .in("entityId", groupIds.map(id => id.toString()));
    
    if (groupPermissions && groupPermissions.length > 0) {
      const hasPermission = groupPermissions.some(p => {
        if (requiredPermission === 'view') return true; // 'edit' permission implies 'view'
        return p.permission === requiredPermission;
      });
      
      if (hasPermission) return true;
    }
  }
  
  return false;
}

export async function getAccessibleDashboards(userId: string): Promise<number[]> {
  // Get all dashboards created by the user
  const ownDashboards = await fine.table("dashboards")
    .select("id")
    .eq("createdBy", userId);
  
  const ownDashboardIds = ownDashboards ? ownDashboards.map(d => d.id as number) : [];
  
  // Get dashboards with direct user permissions
  const userPermissions = await fine.table("dashboardPermissions")
    .select("dashboardId")
    .eq("entityType", "user")
    .eq("entityId", userId);
  
  const userPermissionDashboardIds = userPermissions ? userPermissions.map(p => p.dashboardId) : [];
  
  // Get user groups
  const userGroups = await getUserGroups(userId);
  let groupPermissionDashboardIds: number[] = [];
  
  if (userGroups.length > 0) {
    const groupIds = userGroups.map(group => group.id);
    const groupPermissions = await fine.table("dashboardPermissions")
      .select("dashboardId")
      .eq("entityType", "group")
      .in("entityId", groupIds.map(id => id.toString()));
    
    groupPermissionDashboardIds = groupPermissions ? groupPermissions.map(p => p.dashboardId) : [];
  }
  
  // Combine all dashboard IDs and remove duplicates
  const allDashboardIds = [...ownDashboardIds, ...userPermissionDashboardIds, ...groupPermissionDashboardIds];
  return [...new Set(allDashboardIds)];
}