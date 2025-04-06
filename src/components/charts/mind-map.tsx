import { useEffect, useRef } from "react";

interface MindMapProps {
  data: any;
  config: {
    nodeRadius?: number;
    linkDistance?: number;
    colors?: string[];
  };
}

export function MindMap({ data, config }: MindMapProps) {
  const {
    nodeRadius = 20,
    linkDistance = 100,
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
  } = config;
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    // In a real implementation, we would use D3 to create an interactive mind map
    // For now, we'll just create a simple static visualization
    if (!svgRef.current || !data.nodes || !data.links) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Create a simple static mind map
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw the root node
    if (data.nodes.length > 0) {
      const rootNode = data.nodes[0];
      const rootCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      rootCircle.setAttribute("cx", centerX.toString());
      rootCircle.setAttribute("cy", centerY.toString());
      rootCircle.setAttribute("r", nodeRadius.toString());
      rootCircle.setAttribute("fill", colors[0]);
      svg.appendChild(rootCircle);
      
      // Draw the root label
      const rootText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      rootText.setAttribute("x", (centerX + nodeRadius + 5).toString());
      rootText.setAttribute("y", centerY.toString());
      rootText.setAttribute("font-size", "12");
      rootText.textContent = rootNode.name || "Root";
      svg.appendChild(rootText);
      
      // Draw child nodes in a circle around the root
      const childNodes = data.nodes.slice(1);
      const angleStep = (2 * Math.PI) / childNodes.length;
      
      childNodes.forEach((node: any, index: number) => {
        const angle = index * angleStep;
        const x = centerX + Math.cos(angle) * linkDistance;
        const y = centerY + Math.sin(angle) * linkDistance;
        
        // Draw link
        const link = document.createElementNS("http://www.w3.org/2000/svg", "line");
        link.setAttribute("x1", centerX.toString());
        link.setAttribute("y1", centerY.toString());
        link.setAttribute("x2", x.toString());
        link.setAttribute("y2", y.toString());
        link.setAttribute("stroke", "#999");
        link.setAttribute("stroke-width", "2");
        svg.appendChild(link);
        
        // Draw node
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", nodeRadius.toString());
        circle.setAttribute("fill", colors[(index + 1) % colors.length]);
        svg.appendChild(circle);
        
        // Draw label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (x + nodeRadius + 5).toString());
        text.setAttribute("y", y.toString());
        text.setAttribute("font-size", "12");
        text.textContent = node.name || `Node ${index + 1}`;
        svg.appendChild(text);
      });
    }
  }, [data, nodeRadius, linkDistance, colors]);
  
  // If no data or invalid data format
  if (!data.nodes || !data.links) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Invalid mind map data format</p>
      </div>
    );
  }
  
  return (
    <svg ref={svgRef} className="h-full w-full" />
  );
}