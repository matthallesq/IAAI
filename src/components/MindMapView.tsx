import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Maximize, LayoutGrid } from "lucide-react";

interface TreeNode {
  id: string;
  title: string;
  description?: string;
  color?: string;
  children: TreeNode[];
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  from: NodePosition;
  to: NodePosition;
}

interface MindMapViewProps {
  nodes?: TreeNode[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const MindMapView = ({
  nodes = [],
  onNodeClick,
  className = "",
}: MindMapViewProps) => {
  // Use empty array if no nodes are provided
  const displayNodes = nodes || [];

  // State for zoom and pan
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<"tree" | "radial">("tree");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize expanded nodes
  useEffect(() => {
    const initialExpanded = new Set<string>();
    // Initially expand root nodes
    displayNodes.forEach((node) => initialExpanded.add(node.id));
    setExpandedNodes(initialExpanded);
  }, [displayNodes]);

  // Calculate node positions after render
  useEffect(() => {
    // Wait for the next frame to ensure DOM is updated
    const timer = setTimeout(() => {
      const newPositions: NodePosition[] = [];
      nodeRefs.current.forEach((element, id) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect =
            containerRef.current?.getBoundingClientRect() || {
              left: 0,
              top: 0,
            };

          // Calculate position relative to the container
          newPositions.push({
            id,
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
            width: rect.width,
            height: rect.height,
          });
        }
      });
      setNodePositions(newPositions);
    }, 100);

    return () => clearTimeout(timer);
  }, [expandedNodes, layout, displayNodes, scale]);

  // Zoom functions
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle layout
  const toggleLayout = () => {
    setLayout((prev) => (prev === "tree" ? "radial" : "tree"));
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onNodeClick
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Function to render a node and its children recursively
  const renderNode = (node: TreeNode, isRoot = false, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    return (
      <div
        key={node.id}
        className={`flex ${layout === "tree" ? "flex-col" : ""} items-center ${isRoot ? "" : "mt-4"}`}
      >
        <div
          ref={(el) => {
            if (el) nodeRefs.current.set(node.id, el);
          }}
          className={`p-3 rounded-lg shadow-md cursor-pointer transition-all hover:scale-105 relative ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
          style={{
            backgroundColor: node.color || "#e0e0e0",
            transform: isSelected ? "scale(1.05)" : "scale(1)",
          }}
          onClick={() => handleNodeClick(node.id)}
        >
          <div className="font-medium text-center">{node.title}</div>
          {node.description && (
            <div className="text-xs text-gray-700 mt-1">{node.description}</div>
          )}
          {hasChildren && (
            <div
              className="absolute -right-1 -bottom-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-gray-300"
              onClick={(e) => toggleNodeExpansion(node.id, e)}
            >
              {isExpanded ? "-" : "+"}
            </div>
          )}
          {onAddChildNode && (
            <div
              className="absolute -right-1 -top-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white cursor-pointer hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onNodeClick
                onAddChildNode(node.id);
              }}
              title="Add sub-node"
            >
              +
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div
            className={`flex ${layout === "tree" ? "flex-wrap justify-center" : "flex-row space-x-4"} gap-4 mt-4`}
          >
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-8 bg-gray-300"></div>
                {renderNode(child, false, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Calculate connections between nodes
  const connections = useMemo(() => {
    const result: Connection[] = [];

    // Helper function to find parent-child connections
    const findConnections = (node: TreeNode) => {
      if (!expandedNodes.has(node.id)) return;

      const parentPos = nodePositions.find((pos) => pos.id === node.id);
      if (!parentPos) return;

      node.children.forEach((child) => {
        const childPos = nodePositions.find((pos) => pos.id === child.id);
        if (childPos) {
          result.push({
            from: parentPos,
            to: childPos,
          });
        }
        findConnections(child);
      });
    };

    // Start from root nodes
    displayNodes.forEach((node) => findConnections(node));

    return result;
  }, [nodePositions, expandedNodes, displayNodes]);

  // Render SVG connections
  const renderConnections = () => {
    return connections.map((connection, index) => {
      const { from, to } = connection;

      // Calculate connection points based on layout
      let startX, startY, endX, endY;

      if (layout === "tree") {
        // For tree layout, connect bottom of parent to top of child
        startX = from.x;
        startY = from.y + from.height / 2;
        endX = to.x;
        endY = to.y - to.height / 2;
      } else {
        // For radial layout, connect centers with a curved line
        startX = from.x;
        startY = from.y;
        endX = to.x;
        endY = to.y;
      }

      const isSelected =
        selectedNodeId &&
        (from.id === selectedNodeId || to.id === selectedNodeId);

      return (
        <g key={`connection-${index}`}>
          {layout === "tree" ? (
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={isSelected ? "#3b82f6" : "#aaa"}
              strokeWidth={isSelected ? "2" : "1"}
              strokeLinecap="round"
            />
          ) : (
            <path
              d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 - 30} ${endX} ${endY}`}
              fill="none"
              stroke={isSelected ? "#3b82f6" : "#aaa"}
              strokeWidth={isSelected ? "2" : "1"}
              strokeLinecap="round"
            />
          )}
        </g>
      );
    });
  };

  return (
    <Card className={`bg-white p-4 h-full overflow-hidden ${className}`}>
      <div className="mb-4 border-b pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Site Structure Mind Map</h2>
          <p className="text-sm text-gray-500">
            Mind map visualization of your site structure
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={zoomIn}
            className="p-1 rounded hover:bg-gray-100"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={zoomOut}
            className="p-1 rounded hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 rounded hover:bg-gray-100"
            title="Reset View"
          >
            <Maximize size={18} />
          </button>
          <button
            onClick={toggleLayout}
            className="p-1 rounded hover:bg-gray-100"
            title={`Switch to ${layout === "tree" ? "Radial" : "Tree"} Layout`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>
      <div
        className="flex justify-center p-4 min-h-[400px] overflow-hidden cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-white to-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        ref={containerRef}
        style={{
          borderRadius: "0.5rem",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          {renderConnections()}
        </svg>
        <div
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.3s ease",
            position: "relative",
            width: layout === "radial" ? "100%" : "auto",
            height: layout === "radial" ? "100%" : "auto",
          }}
        >
          {displayNodes.length > 0 ? (
            <div
              className={`mind-map-container ${layout === "radial" ? "flex justify-center items-center h-full" : ""}`}
            >
              {displayNodes.map((node, index) =>
                renderNode(node, true, 0, displayNodes.length, index),
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MindMapView;
