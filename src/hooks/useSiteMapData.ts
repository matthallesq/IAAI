import { useState } from "react";

interface Position {
  x: number;
  y: number;
}

export interface PostItNote {
  id: string;
  title: string;
  description: string;
  color: string;
  position: Position;
  zIndex: number;
  parentId?: string;
}

export interface Connection {
  from: string;
  to: string;
}

export interface TreeNode {
  id: string;
  title: string;
  description?: string;
  color?: string;
  children: TreeNode[];
}

export const useSiteMapData = () => {
  const [notes, setNotes] = useState<PostItNote[]>([
    {
      id: "1",
      title: "Home Page",
      description: "Main landing page for the website",
      color: "#ffcc80",
      position: { x: 400, y: 100 },
      zIndex: 1,
    },
    {
      id: "2",
      title: "About Us",
      description: "Information about the company",
      color: "#80deea",
      position: { x: 200, y: 300 },
      zIndex: 1,
      parentId: "1",
    },
    {
      id: "3",
      title: "Services",
      description: "List of services offered",
      color: "#a5d6a7",
      position: { x: 600, y: 300 },
      zIndex: 1,
      parentId: "1",
    },
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleAddNote = (parentId?: string) => {
    const newNote: PostItNote = {
      id: Date.now().toString(),
      title: "New Page",
      description: "Add description here",
      color: getRandomColor(),
      position: { x: 400, y: 200 },
      zIndex: 1,
      parentId,
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
          zIndex: 1,
        },
        {
          id: "imported-2",
          title: "Imported About",
          description: "About page from import",
          color: "#80deea",
          position: { x: 200, y: 300 },
          zIndex: 1,
          parentId: "imported-1",
        },
        {
          id: "imported-3",
          title: "Imported Contact",
          description: "Contact page from import",
          color: "#a5d6a7",
          position: { x: 600, y: 300 },
          zIndex: 1,
          parentId: "imported-1",
        },
      ];

      setNotes(importedNotes);
      setIsImporting(false);
    }, 2000);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
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

  // Convert PostItNotes to TreeNodes for TreeView and TableView
  const convertNotesToTreeNodes = (): TreeNode[] => {
    // First, create a map of all notes
    const notesMap = new Map<string, PostItNote>();
    notes.forEach((note) => {
      notesMap.set(note.id, note);
    });

    // Find root nodes (notes without a parent)
    const rootNotes = notes.filter((note) => !note.parentId);

    // Recursive function to build the tree
    const buildTree = (note: PostItNote): TreeNode => {
      const children = notes
        .filter((n) => n.parentId === note.id)
        .map((childNote) => buildTree(childNote));

      return {
        id: note.id,
        title: note.title,
        description: note.description,
        color: note.color,
        children,
      };
    };

    // Build tree starting from root nodes
    return rootNotes.map((rootNote) => buildTree(rootNote));
  };

  const treeNodes = convertNotesToTreeNodes();

  return {
    notes,
    setNotes,
    connections,
    setConnections,
    isImporting,
    treeNodes,
    handleAddNote,
    handleImportUrl,
    handleUpdateNote,
    handleDeleteNote,
  };
};
