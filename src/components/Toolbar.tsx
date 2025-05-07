import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PlusCircle, Download, GitBranch, Globe, Loader2 } from "lucide-react";
import ViewLinks from "@/components/ViewLinks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";

interface ToolbarProps {
  onAddNote?: () => void;
  onImportUrl?: (url: string) => void;
  onToggleView?: () => void;
  onExport?: (format: string) => void;
  isTreeView?: boolean;
  isLoading?: boolean;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const Toolbar = ({
  onAddNote = () => {},
  onImportUrl = () => {},
  onToggleView = () => {},
  onExport = () => {},
  isTreeView = false,
  isLoading = false,
  activeView = "canvas",
  onViewChange = () => {},
}: ToolbarProps) => {
  const [url, setUrl] = useState("");
  const [exportFormat, setExportFormat] = useState("png");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onImportUrl(url);
    setImportDialogOpen(false);
  };

  const handleAddNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddNote();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAddNote} variant="outline" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new note</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Import from URL</DialogTitle>
              <DialogDescription>
                Enter a website URL to automatically generate a site map
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImportSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!url.trim() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ViewLinks activeView={activeView} onViewChange={onViewChange} />
      </div>

      <div className="flex items-center space-x-2">
        <Select value={exportFormat} onValueChange={setExportFormat}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onExport(exportFormat)}
                variant="outline"
                size="icon"
              >
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export as {exportFormat.toUpperCase()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Toolbar;
