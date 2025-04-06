import { fine } from "./fine";

export interface DatabaseSchema {
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
    }[];
  }[];
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

// Function to get schema from dummy database
export async function getDummyDatabaseSchema(): Promise<DatabaseSchema> {
  return {
    tables: [
      {
        name: "dummyData",
        columns: [
          { name: "id", type: "INTEGER" },
          { name: "category", type: "TEXT" },
          { name: "value", type: "REAL" },
          { name: "date", type: "TEXT" },
          { name: "region", type: "TEXT" }
        ]
      }
    ]
  };
}

// Function to query dummy database
export async function queryDummyDatabase(query: string): Promise<QueryResult> {
  // For simplicity, we'll just return all data from dummyData table
  // In a real implementation, you would parse the query and execute it
  const data = await fine.table("dummyData").select();
  
  if (!data) {
    return { columns: [], rows: [] };
  }
  
  return {
    columns: ["id", "category", "value", "date", "region"],
    rows: data
  };
}

// Function to get data for a specific chart type
export async function getChartData(chartType: string, config: any): Promise<any> {
  // In a real implementation, you would use the config to query the appropriate database
  // For now, we'll just return dummy data based on the chart type
  
  const dummyData = await fine.table("dummyData").select();
  if (!dummyData) return [];
  
  switch (chartType) {
    case 'pie':
      // Group by category and sum values
      return dummyData.reduce((acc: any[], item: any) => {
        const existingItem = acc.find(i => i.name === item.category);
        if (existingItem) {
          existingItem.value += item.value;
        } else {
          acc.push({ name: item.category, value: item.value });
        }
        return acc;
      }, []);
      
    case 'bar':
    case 'line':
      // Group by date and category
      const groupedByDate = dummyData.reduce((acc: any, item: any) => {
        if (!acc[item.date]) {
          acc[item.date] = {};
        }
        if (!acc[item.date][item.category]) {
          acc[item.date][item.category] = 0;
        }
        acc[item.date][item.category] += item.value;
        return acc;
      }, {});
      
      // Convert to format needed for recharts
      return Object.entries(groupedByDate).map(([date, categories]: [string, any]) => {
        return {
          date,
          ...categories
        };
      });
      
    case 'scatter':
      return dummyData.map((item: any) => ({
        x: new Date(item.date).getTime(),
        y: item.value,
        category: item.category,
        region: item.region
      }));
      
    case 'table':
      return dummyData;
      
    default:
      return dummyData;
  }
}