import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Canvas from "./Canvas";
import TreeView from "./TreeView";
import TableView from "./TableView";
import Toolbar from "./Toolbar";
import { motion } from "framer-motion";
import CanvasWithAddNoteStoryboard from "../tempobook/storyboards/ce7e2b6e-b0c9-428d-9ed9-d095a6dd689b";
import useSiteMapData from "@/hooks/useSiteMapData";

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
          <div>
            <img
              src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=150&q=80"
              alt="IAAI Logo"
              className="h-8"
            />
          </div>
          <div className="flex items-center space-x-5">
            <motion.h1
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              IAAI
            </motion.h1>
            <Toolbar
              onAddNote={handleAddNote}
              onImportUrl={handleImportUrl}
              isLoading={isImporting}
              onExport={handleExport}
              activeView={activeView}
              onViewChange={setActiveView}
            />
          </div>
        </div>
      </header>
      <main className="flex-0 w-full p-0 overflow-hidden">
        <div className="mt-2 bg-white rounded-lg shadow-md p-2 h-[calc(100vh-10px)]">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full h-full"
          >
            {/* TabsList moved to header */}
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
          AIIA © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
