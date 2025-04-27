import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TreeNode {
  id: string;
  title: string;
  description?: string;
  color?: string;
  children: TreeNode[];
}

interface TableViewProps {
  nodes?: TreeNode[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const TableView = ({
  nodes = [],
  onNodeClick,
  className = "",
}: TableViewProps) => {
  // Use empty array if no nodes are provided
  const displayNodes = nodes || [];

  // Function to flatten the tree structure for table display
  const flattenNodes = (
    nodes: TreeNode[],
    parentTitle = "",
    level = 0,
  ): any[] => {
    return nodes.flatMap((node) => {
      const flatNode = {
        id: node.id,
        title: node.title,
        description: node.description || "",
        parent: parentTitle,
        level,
        color: node.color,
      };

      if (node.children && node.children.length > 0) {
        return [
          flatNode,
          ...flattenNodes(node.children, node.title, level + 1),
        ];
      }

      return [flatNode];
    });
  };

  const flattenedNodes = flattenNodes(displayNodes);

  const handleNodeClick = (nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  return (
    <Card className={`bg-white p-4 h-full overflow-auto ${className}`}>
      <div className="mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold">Site Structure Table</h2>
        <p className="text-sm text-gray-500">Tabular view of your site map</p>
      </div>
      <Table>
        <TableCaption>A list of all pages in your site structure</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Parent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedNodes.map((node) => (
            <TableRow
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: node.color || "#e0e0e0" }}
                  />
                  {node.id}
                </div>
              </TableCell>
              <TableCell>
                <div style={{ paddingLeft: `${node.level * 20}px` }}>
                  {node.title}
                </div>
              </TableCell>
              <TableCell>{node.description}</TableCell>
              <TableCell>{node.parent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TableView;
