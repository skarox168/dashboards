export interface Widget {
  id: string;
  type: string;
  title: string;
  config: any;
  dataSource: any;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface Dashboard {
  id?: number;
  name: string;
  description?: string;
  layout: {
    widgets: Widget[];
  };
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean; // Add this property
}

export interface DashboardTemplate extends Omit<Dashboard, 'id'> {
  id?: number;
}

export interface DatabaseConnection {
  id?: number;
  name: string;
  type: string;
  config: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    connectionString?: string;
    [key: string]: any;
  };
}

export interface UserGroup {
  id?: number;
  name: string;
  description?: string;
}

export interface PermissionEntity {
  id: string;
  name: string;
  type: 'user' | 'group';
}

export interface Permission {
  entityId: string;
  entityType: 'user' | 'group';
  permission: 'view' | 'edit' | 'read' | 'write';
}

export type WidgetType = 
  | 'pie' 
  | 'bar' 
  | 'line' 
  | 'table' 
  | 'kpi' 
  | 'mindMap' 
  | 'flowChart' 
  | 'scatter' 
  | 'gauge' 
  | 'groupedBar' 
  | 'stackedBar' 
  | 'dualAxis' 
  | 'text';