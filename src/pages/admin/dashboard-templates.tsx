import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, BarChart3, PieChart, LineChart } from "lucide-react";
import { fine } from "@/lib/fine";
import { DashboardTemplate } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function DashboardTemplates() {
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const fetchedTemplates = await fine.table("dashboardTemplates").select();
        
        if (fetchedTemplates) {
          const templatesWithParsedLayout = fetchedTemplates.map((template) => ({
            ...template,
            layout: JSON.parse(template.layout),
          }));
          
          setTemplates(templatesWithParsedLayout);
        }
      } catch (error) {
        console.error("Error fetching dashboard templates:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard templates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
    
    // If no templates exist, create some default ones
    const createDefaultTemplates = async () => {
      try {
        const existingTemplates = await fine.table("dashboardTemplates").select();
        
        if (!existingTemplates || existingTemplates.length === 0) {
          // Create default templates
          const defaultTemplates = [
            {
              name: "Sales Dashboard",
              description: "A template for tracking sales performance with various charts and KPIs",
              layout: JSON.stringify({
                widgets: [
                  {
                    id: "sales-overview",
                    type: "kpi",
                    title: "Total Sales",
                    config: {
                      valueKey: "value",
                      labelKey: "label",
                      changeKey: "change",
                      format: "currency",
                      prefix: "$",
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData LIMIT 1",
                    },
                    position: { x: 0, y: 0 },
                    size: { width: 3, height: 2 },
                  },
                  {
                    id: "sales-by-product",
                    type: "pie",
                    title: "Sales by Product",
                    config: {
                      colors: ["#8884d8", "#82ca9d", "#ffc658"],
                      innerRadius: 60,
                      outerRadius: 80,
                      dataKey: "value",
                      nameKey: "category",
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 3, y: 0 },
                    size: { width: 4, height: 4 },
                  },
                  {
                    id: "sales-trend",
                    type: "line",
                    title: "Sales Trend",
                    config: {
                      xAxisKey: "date",
                      dataKeys: ["Product A", "Product B", "Product C"],
                      colors: ["#8884d8", "#82ca9d", "#ffc658"],
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 0, y: 4 },
                    size: { width: 7, height: 4 },
                  },
                  {
                    id: "sales-by-region",
                    type: "bar",
                    title: "Sales by Region",
                    config: {
                      xAxisKey: "region",
                      dataKeys: ["Product A", "Product B", "Product C"],
                      colors: ["#8884d8", "#82ca9d", "#ffc658"],
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 7, y: 0 },
                    size: { width: 5, height: 4 },
                  },
                  {
                    id: "sales-table",
                    type: "table",
                    title: "Sales Data",
                    config: {
                      columns: ["category", "value", "date", "region"],
                      pageSize: 5,
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 7, y: 4 },
                    size: { width: 5, height: 4 },
                  },
                ],
              }),
              createdBy: "system",
            },
            {
              name: "Analytics Dashboard",
              description: "A template for tracking website analytics and user behavior",
              layout: JSON.stringify({
                widgets: [
                  {
                    id: "visitors-kpi",
                    type: "kpi",
                    title: "Total Visitors",
                    config: {
                      valueKey: "value",
                      labelKey: "label",
                      changeKey: "change",
                      format: "number",
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData LIMIT 1",
                    },
                    position: { x: 0, y: 0 },
                    size: { width: 3, height: 2 },
                  },
                  {
                    id: "pageviews-kpi",
                    type: "kpi",
                    title: "Page Views",
                    config: {
                      valueKey: "value",
                      labelKey: "label",
                      changeKey: "change",
                      format: "number",
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData LIMIT 1",
                    },
                    position: { x: 3, y: 0 },
                    size: { width: 3, height: 2 },
                  },
                  {
                    id: "traffic-sources",
                    type: "pie",
                    title: "Traffic Sources",
                    config: {
                      colors: ["#8884d8", "#82ca9d", "#ffc658"],
                      innerRadius: 0,
                      outerRadius: 80,
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 6, y: 0 },
                    size: { width: 6, height: 4 },
                  },
                  {
                    id: "visitor-trend",
                    type: "line",
                    title: "Visitor Trend",
                    config: {
                      xAxisKey: "date",
                      dataKeys: ["Product A"],
                      colors: ["#8884d8"],
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 0, y: 2 },
                    size: { width: 6, height: 4 },
                  },
                  {
                    id: "top-pages",
                    type: "table",
                    title: "Top Pages",
                    config: {
                      columns: ["category", "value"],
                      pageSize: 5,
                    },
                    dataSource: {
                      databaseId: "dummy",
                      query: "SELECT * FROM dummyData",
                    },
                    position: { x: 0, y: 6 },
                    size: { width: 12, height: 4 },
                  },
                ],
              }),
              createdBy: "system",
            },
          ];
          
          await fine.table("dashboardTemplates").insert(defaultTemplates);
          
          // Fetch the created templates
          const createdTemplates = await fine.table("dashboardTemplates").select();
          
          if (createdTemplates) {
            const templatesWithParsedLayout = createdTemplates.map((template) => ({
              ...template,
              layout: JSON.parse(template.layout),
            }));
            
            setTemplates(templatesWithParsedLayout);
          }
        }
      } catch (error) {
        console.error("Error creating default templates:", error);
      }
    };
    
    createDefaultTemplates();
  }, [toast]);

  const handleUseTemplate = async (template: DashboardTemplate) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use this template",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      // Create a new dashboard from the template
      const newDashboard = {
        name: `${template.name} Copy`,
        description: template.description,
        layout: JSON.stringify(template.layout),
        createdBy: session.user.id,
      };
      
      const savedDashboard = await fine.table("dashboards").insert(newDashboard).select();
      
      if (!savedDashboard || savedDashboard.length === 0) {
        throw new Error("Failed to create dashboard from template");
      }
      
      const newDashboardId = savedDashboard[0].id;
      
      toast({
        title: "Dashboard created",
        description: "New dashboard created from template",
      });
      
      navigate(`/dashboards/${newDashboardId}/edit`);
    } catch (error) {
      console.error("Error using template:", error);
      toast({
        title: "Error",
        description: "Failed to create dashboard from template",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Templates</h1>
        </div>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No Templates</CardTitle>
              <CardDescription>
                No dashboard templates are available yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Templates help you get started quickly with pre-configured dashboards
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {template.name.includes("Sales") ? (
                      <BarChart3 className="h-5 w-5 mr-2" />
                    ) : template.name.includes("Analytics") ? (
                      <LineChart className="h-5 w-5 mr-2" />
                    ) : (
                      <PieChart className="h-5 w-5 mr-2" />
                    )}
                    {template.name}
                  </CardTitle>
                  <CardDescription>
                    {template.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-muted/50 p-4 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      <div className="bg-primary/20 rounded-md h-16"></div>
                      <div className="bg-primary/20 rounded-md h-16"></div>
                      <div className="bg-primary/20 rounded-md h-16 col-span-2"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button
                    className="w-full"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle>Create Custom Template</CardTitle>
                <CardDescription>
                  Design your own dashboard template from scratch
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Plus className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Start with a blank canvas and save your design as a template
                </p>
              </CardContent>
              <CardFooter className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboards/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}