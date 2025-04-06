-- Users table is already handled by Fine auth

-- UserGroups
CREATE TABLE userGroups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UserGroupMembers
CREATE TABLE userGroupMembers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  groupId INTEGER NOT NULL,
  FOREIGN KEY (groupId) REFERENCES userGroups(id) ON DELETE CASCADE
);

-- DatabaseConnections
CREATE TABLE databaseConnections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON string with connection details
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DatabasePermissions
CREATE TABLE databasePermissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  databaseId INTEGER NOT NULL,
  entityType TEXT NOT NULL, -- 'user' or 'group'
  entityId TEXT NOT NULL, -- userId or groupId
  permission TEXT NOT NULL, -- 'read', 'write', etc.
  FOREIGN KEY (databaseId) REFERENCES databaseConnections(id) ON DELETE CASCADE
);

-- Dashboards
CREATE TABLE dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  layout TEXT NOT NULL, -- JSON string with layout configuration
  createdBy TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DashboardPermissions
CREATE TABLE dashboardPermissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboardId INTEGER NOT NULL,
  entityType TEXT NOT NULL, -- 'user' or 'group'
  entityId TEXT NOT NULL, -- userId or groupId
  permission TEXT NOT NULL, -- 'view', 'edit', etc.
  FOREIGN KEY (dashboardId) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- DashboardTemplates
CREATE TABLE dashboardTemplates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  layout TEXT NOT NULL, -- JSON string with layout configuration
  createdBy TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Widgets
CREATE TABLE widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboardId INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON string with widget configuration
  dataSource TEXT NOT NULL, -- JSON string with data source configuration
  position TEXT NOT NULL, -- JSON string with position information
  size TEXT NOT NULL, -- JSON string with size information
  FOREIGN KEY (dashboardId) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- DummyDatabase for testing
CREATE TABLE dummyData (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  value REAL NOT NULL,
  date TEXT NOT NULL,
  region TEXT NOT NULL
);

-- Insert some dummy data
INSERT INTO dummyData (category, value, date, region) VALUES 
('Product A', 235, '2023-01-01', 'North'),
('Product B', 185, '2023-01-01', 'North'),
('Product C', 320, '2023-01-01', 'North'),
('Product A', 340, '2023-01-01', 'South'),
('Product B', 275, '2023-01-01', 'South'),
('Product C', 190, '2023-01-01', 'South'),
('Product A', 290, '2023-02-01', 'North'),
('Product B', 205, '2023-02-01', 'North'),
('Product C', 345, '2023-02-01', 'North'),
('Product A', 360, '2023-02-01', 'South'),
('Product B', 300, '2023-02-01', 'South'),
('Product C', 210, '2023-02-01', 'South'),
('Product A', 310, '2023-03-01', 'North'),
('Product B', 230, '2023-03-01', 'North'),
('Product C', 370, '2023-03-01', 'North'),
('Product A', 380, '2023-03-01', 'South'),
('Product B', 320, '2023-03-01', 'South'),
('Product C', 240, '2023-03-01', 'South');