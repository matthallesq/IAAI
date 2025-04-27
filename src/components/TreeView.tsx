import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TreeNode {
  id: string;
  title: string;
  description?: string;
  color?: string;
  children: TreeNode[];
}

interface TreeViewProps {
  nodes?: TreeNode[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const TreeView = ({
  nodes = [],
  onNodeClick,
  className = "",
}: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  // Default sample data if no nodes are provided
  const defaultNodes: TreeNode[] = [
    {
      id: "1",
      title: "Home",
      description: "Main landing page",
      color: "#ffcc80",
      children: [
        {
          id: "2",
          title: "About Us",
          description: "Company information",
          color: "#80deea",
          children: [],
        },
        {
          id: "3",
          title: "Services",
          description: "What we offer",
          color: "#a5d6a7",
          children: [
            {
              id: "4",
              title: "Service 1",
              description: "First service details",
              color: "#ce93d8",
              children: [],
            },
            {
              id: "5",
              title: "Service 2",
              description: "Second service details",
              color: "#ef9a9a",
              children: [],
            },
          ],
        },
        {
          id: "6",
          title: "Contact",
          description: "Get in touch",
          color: "#fff59d",
          children: [],
        },
      ],
    },
  ];

  const displayNodes = nodes.length > 0 ? nodes : defaultNodes;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleNodeClick = (nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  // Initialize all top-level nodes as expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    displayNodes.forEach((node) => {
      initialExpanded[node.id] = true;
    });
    setExpandedNodes(initialExpanded);
  }, []);

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];

    return (
      <div key={node.id} className="mb-1">
        <div
          className={`flex items-center py-2 px-2 rounded-md hover:bg-gray-100 cursor-pointer`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <div
              className="mr-1 p-1 hover:bg-gray-200 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-6" />}
          <div
            className="flex-1 flex items-center"
            onClick={() => handleNodeClick(node.id)}
          >
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: node.color || "#e0e0e0" }}
            />
            <div>
              <div className="font-medium">{node.title}</div>
              {node.description && (
                <div className="text-xs text-gray-500">{node.description}</div>
              )}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map((childNode) =>
              renderTreeNode(childNode, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`bg-white p-4 h-full overflow-auto ${className}`}>
      <div className="mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold">Site Structure Tree</h2>
        <p className="text-sm text-gray-500">
          Hierarchical view of your site map
        </p>
      </div>
      <div className="tree-container">
        {displayNodes.map((node) => renderTreeNode(node))}
      </div>
    </Card>
  );
};

export default TreeView;
