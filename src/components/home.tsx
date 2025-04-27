import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Canvas from "./Canvas";
import TreeView from "./TreeView";
import Toolbar from "./Toolbar";
import { motion } from "framer-motion";

interface PostItNote {
  id: string;
  title: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  parentId?: string;
}

export default function Home() {
  const [notes, setNotes] = useState<PostItNote[]>([
    {
      id: "1",
      title: "Home Page",
      description: "Main landing page for the website",
      color: "#ffcc80",
      position: { x: 400, y: 100 },
    },
    {
      id: "2",
      title: "About Us",
      description: "Information about the company",
      color: "#80deea",
      position: { x: 200, y: 300 },
      parentId: "1",
    },
    {
      id: "3",
      title: "Services",
      description: "List of services offered",
      color: "#a5d6a7",
      position: { x: 600, y: 300 },
      parentId: "1",
    },
  ]);

  const [activeView, setActiveView] = useState("canvas");
  const [isImporting, setIsImporting] = useState(false);

  const handleAddNote = () => {
    const newNote: PostItNote = {
      id: Date.now().toString(),
      title: "New Page",
      description: "Add description here",
      color: getRandomColor(),
      position: { x: 400, y: 200 },
    };

    setNotes([...notes, newNote]);
  };

  const handleImportUrl = (url: string) => {
    setIsImporting(true);
    // Simulate URL import with timeout
    setTimeout(() => {
      const importedNotes: PostItNote[] = [
        {
          id: "imported-1",
          title: "Imported Home",
          description: `Imported from ${url}`,
          color: "#ffcc80",
          position: { x: 400, y: 100 },
        },
        {
          id: "imported-2",
          title: "Imported About",
          description: "About page from import",
          color: "#80deea",
          position: { x: 200, y: 300 },
          parentId: "imported-1",
        },
        {
          id: "imported-3",
          title: "Imported Contact",
          description: "Contact page from import",
          color: "#a5d6a7",
          position: { x: 600, y: 300 },
          parentId: "imported-1",
        },
      ];

      setNotes(importedNotes);
      setIsImporting(false);
    }, 2000);
  };

  const handleUpdateNote = (updatedNote: PostItNote) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

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

  const getRandomColor = () => {
    const colors = [
      "#ffcc80",
      "#80deea",
      "#a5d6a7",
      "#ef9a9a",
      "#ce93d8",
      "#b39ddb",
      "#9fa8da",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
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

      <main className="flex-1 container mx-auto p-4">
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

        <div className="mt-4 bg-white rounded-lg shadow-md p-2 h-[calc(100vh-200px)]">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="canvas">Canvas View</TabsTrigger>
              <TabsTrigger value="tree">Tree View</TabsTrigger>
            </TabsList>
            <TabsContent value="canvas" className="h-full">
              <Canvas
                notes={notes.map((note) => ({
                  ...note,
                  zIndex: 1,
                  position: note.position,
                }))}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onNotesChange={(updatedNotes) => {
                  setNotes(
                    updatedNotes.map((note) => ({
                      id: note.id,
                      title: note.title,
                      description: note.description,
                      color: note.color,
                      position: note.position,
                      parentId: note.parentId,
                    })),
                  );
                }}
              />
            </TabsContent>
            <TabsContent value="tree" className="h-full">
              <TreeView notes={notes} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white p-4 shadow-inner mt-auto">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          Post-it Note Site Mapping Tool © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
