export type Schema = {
  userGroups: {
    id?: number;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  
  userGroupMembers: {
    id?: number;
    userId: string;
    groupId: number;
  };
  
  databaseConnections: {
    id?: number;
    name: string;
    type: string;
    config: string; // JSON string
    createdAt?: string;
    updatedAt?: string;
  };
  
  databasePermissions: {
    id?: number;
    databaseId: number;
    entityType: 'user' | 'group';
    entityId: string;
    permission: string;
  };
  
  dashboards: {
    id?: number;
    name: string;
    description?: string | null;
    layout: string; // JSON string
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  dashboardPermissions: {
    id?: number;
    dashboardId: number;
    entityType: 'user' | 'group';
    entityId: string;
    permission: 'view' | 'edit';
  };
  
  dashboardTemplates: {
    id?: number;
    name: string;
    description?: string | null;
    layout: string; // JSON string
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  widgets: {
    id?: number;
    dashboardId: number;
    type: string;
    title: string;
    config: string; // JSON string
    dataSource: string; // JSON string
    position: string; // JSON string
    size: string; // JSON string
  };
  
  dummyData: {
    id?: number;
    category: string;
    value: number;
    date: string;
    region: string;
  };
}