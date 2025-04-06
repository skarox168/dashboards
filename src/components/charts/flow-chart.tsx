import { useEffect, useRef } from "react";

interface FlowChartProps {
  data: any;
  config: {
    nodeWidth?: number;
    nodeHeight?: number;
    nodePadding?: number;
    colors?: string[];
  };
}

export function FlowChart({ data, config }: FlowChartProps) {
  const {
    nodeWidth = 150,
    nodeHeight = 40,
    nodePadding = 10,
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
  } = config;
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    // In a real implementation, we would use D3 to create an interactive flow chart
    // For now, we'll just create a simple static visualization
    if (!svgRef.current || !data.nodes || !data.links) return;
    
    const svg = svgRef.current;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Create a simple static flow chart
    const nodes = data.nodes.map((node: any, i: number) => ({
      ...node,
      x: (i % 3) * (nodeWidth + 50) + 100,
      y: Math.floor(i / 3) * (nodeHeight + 50) + 50,
      color: colors[i % colors.length]
    }));
    
    // Create a marker for arrowheads
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
    
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("viewBox", "0 -5 10 10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "0");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto");
    defs.appendChild(marker);
    
    const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowPath.setAttribute("d", "M0,-5L10,0L0,5");
    arrowPath.setAttribute("fill", "#999");
    marker.appendChild(arrowPath);
    
    // Draw links
    data.links.forEach((link: any) => {
      const source = nodes.find((n: any) => n.id === link.source);
      const target = nodes.find((n: any) => n.id === link.target);
      
      if (source && target) {
        const sourceX = source.x + nodeWidth;
        const sourceY = source.y + nodeHeight / 2;
        const targetX = target.x;
        const targetY = target.y + nodeHeight / 2;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M${sourceX},${sourceY} C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#999");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("marker-end", "url(#arrowhead)");
        svg.appendChild(path);
      }
    });
    
    // Draw nodes
    nodes.forEach((node: any) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("transform", `translate(${node.x},${node.y})`);
      svg.appendChild(group);
      
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", nodeWidth.toString());
      rect.setAttribute("height", nodeHeight.toString());
      rect.setAttribute("rx", "5");
      rect.setAttribute("ry", "5");
      rect.setAttribute("fill", node.color);
      group.appendChild(rect);
      
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (nodeWidth / 2).toString());
      text.setAttribute("y", (nodeHeight / 2).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "white");
      text.textContent = node.name || `Node ${node.id}`;
      group.appendChild(text);
    });
  }, [data, nodeWidth, nodeHeight, nodePadding, colors]);
  
  // If no data or invalid data format
  if (!data.nodes || !data.links) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Invalid flow chart data format</p>
      </div>
    );
  }
  
  return (
    <svg ref={svgRef} className="h-full w-full" />
  );
}