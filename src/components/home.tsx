import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Canvas from "./Canvas";
import TreeView from "./TreeView";
import TableView from "./TableView";
import Toolbar from "./Toolbar";
import { motion } from "framer-motion";
import CanvasWithAddNoteStoryboard from "../tempobook/storyboards/ce7e2b6e-b0c9-428d-9ed9-d095a6dd689b";
import { useSiteMapData } from "@/hooks/useSiteMapData";

export default function Home() {
  const {
    notes,
    connections,
    isImporting,
    treeNodes,
    handleAddNote,
    handleImportUrl,
    handleUpdateNote,
    handleDeleteNote,
  } = useSiteMapData();

  const [activeView, setActiveView] = useState("canvas");

  const handleExport = (format: "png" | "pdf" | "json") => {
    // Placeholder for export functionality
    if (format === "json") {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(notes));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "sitemap.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else {
      alert(
        `Exporting as ${format} - This feature is not fully implemented yet`,
      );
    }
  };

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm p-2">
        <div className="w-full flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold text-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Post-it Note Site Mapping Tool
          </motion.h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setActiveView(activeView === "canvas" ? "tree" : "canvas")
              }
            >
              {activeView === "canvas"
                ? "Switch to Tree View"
                : "Switch to Canvas View"}
            </Button>
            <Button onClick={() => handleExport("json")}>Export</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-2 overflow-hidden">
        <Toolbar
          onAddNote={handleAddNote}
          onImportUrl={handleImportUrl}
          isLoading={isImporting}
          onExport={handleExport}
          onToggleView={() =>
            setActiveView(activeView === "canvas" ? "tree" : "canvas")
          }
          isTreeView={activeView === "tree"}
        />

        <div className="mt-2 bg-white rounded-lg shadow-md p-2 h-[calc(100vh-130px)]">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full h-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="tree">Tree</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="canvas" className="h-[calc(100%-40px)]">
              <CanvasWithAddNoteStoryboard
                notes={notes}
                connections={connections}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            </TabsContent>
            <TabsContent value="tree" className="h-[calc(100%-40px)]">
              <TreeView nodes={treeNodes} />
            </TabsContent>
            <TabsContent value="table" className="h-[calc(100%-40px)]">
              <TableView nodes={treeNodes} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white p-2 shadow-inner">
        <div className="w-full text-center text-gray-500 text-sm">
          Post-it Note Site Mapping Tool © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
