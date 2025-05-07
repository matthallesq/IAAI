import React from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { LayoutGrid, List, Table2 } from "lucide-react";

interface ViewLinksProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ViewLinks: React.FC<ViewLinksProps> = ({ activeView, onViewChange }) => {
  const views = [
    {
      id: "canvas",
      label: "Canvas View",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    { id: "tree", label: "Tree View", icon: <List className="h-5 w-5" /> },
    { id: "table", label: "Table View", icon: <Table2 className="h-5 w-5" /> },
  ];

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md border border-gray-200">
      <TooltipProvider>
        {views.map((view) => (
          <Tooltip key={view.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeView === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(view.id)}
                className={activeView === view.id ? "bg-white shadow-sm" : ""}
              >
                {view.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{view.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default ViewLinks;
