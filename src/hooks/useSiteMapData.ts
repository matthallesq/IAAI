import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Note {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  color?: string;
  url?: string;
}

export interface Connection {
  source: string;
  target: string;
}

export interface TreeNode {
  id: string;
  title: string;
  content: string;
  url?: string;
  children?: TreeNode[];
}

export default function useSiteMapData() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);

  // Generate tree nodes from notes and connections
  useEffect(() => {
    // Simple algorithm to convert flat notes and connections to a tree structure
    const generateTree = () => {
      if (notes.length === 0) return [];

      // Create a map of all notes by ID for quick lookup
      const notesMap = notes.reduce(
        (acc, note) => {
          acc[note.id] = { ...note, children: [] };
          return acc;
        },
        {} as Record<string, TreeNode>,
      );

      // Track which nodes are children (have parents)
      const childNodes = new Set<string>();

      // Connect children to parents based on connections
      connections.forEach(({ source, target }) => {
        if (notesMap[source] && notesMap[target]) {
          notesMap[source].children = notesMap[source].children || [];
          notesMap[source].children.push(notesMap[target]);
          childNodes.add(target);
        }
      });

      // Return only root nodes (those without parents)
      return Object.values(notesMap).filter((node) => !childNodes.has(node.id));
    };

    setTreeNodes(generateTree());
  }, [notes, connections]);

  const handleAddNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: "New Page",
      content: "Add description here",
      x: Math.random() * 500,
      y: Math.random() * 300,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
    };

    setNotes((prev) => [...prev, newNote]);
  };

  const handleImportUrl = async (url: string) => {
    setIsImporting(true);

    try {
      // Simulate URL import with a timeout
      // In a real implementation, this would call an API to scrape the website
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a sample site structure based on the URL
      const domain = new URL(url).hostname;

      const newNotes: Note[] = [
        {
          id: uuidv4(),
          title: domain,
          content: "Homepage",
          x: 400,
          y: 100,
          url,
          color: `hsl(${Math.random() * 360}, 70%, 80%)`,
        },
        {
          id: uuidv4(),
          title: "About",
          content: "About page",
          x: 200,
          y: 300,
          url: `${url}/about`,
          color: `hsl(${Math.random() * 360}, 70%, 80%)`,
        },
        {
          id: uuidv4(),
          title: "Contact",
          content: "Contact page",
          x: 400,
          y: 300,
          url: `${url}/contact`,
          color: `hsl(${Math.random() * 360}, 70%, 80%)`,
        },
        {
          id: uuidv4(),
          title: "Products",
          content: "Products page",
          x: 600,
          y: 300,
          url: `${url}/products`,
          color: `hsl(${Math.random() * 360}, 70%, 80%)`,
        },
      ];

      const newConnections: Connection[] = [
        { source: newNotes[0].id, target: newNotes[1].id },
        { source: newNotes[0].id, target: newNotes[2].id },
        { source: newNotes[0].id, target: newNotes[3].id },
      ];

      setNotes((prev) => [...prev, ...newNotes]);
      setConnections((prev) => [...prev, ...newConnections]);
    } catch (error) {
      console.error("Error importing URL:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    setConnections((prev) =>
      prev.filter((conn) => conn.source !== noteId && conn.target !== noteId),
    );
  };

  return {
    notes,
    connections,
    isImporting,
    treeNodes,
    handleAddNote,
    handleImportUrl,
    handleUpdateNote,
    handleDeleteNote,
  };
}
