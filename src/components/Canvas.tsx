import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PostItNote from "./PostItNote";

interface Position {
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

interface PostItNoteData {
  id: string;
  title: string;
  description: string;
  position: Position;
  color: string;
  zIndex: number;
  parentId?: string;
}

interface CanvasProps {
  notes?: PostItNoteData[];
  connections?: Connection[];
  onNotesChange?: (notes: PostItNoteData[]) => void;
  onConnectionsChange?: (connections: Connection[]) => void;
  isTreeView?: boolean;
  onUpdateNote?: (note: PostItNoteData) => void;
  onDeleteNote?: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  notes = [],
  connections = [],
  onNotesChange = () => {},
  onConnectionsChange = () => {},
  isTreeView = false,
  onUpdateNote = () => {},
  onDeleteNote = () => {},
}) => {
  const [canvasNotes, setCanvasNotes] = useState<PostItNoteData[]>(notes);
  const [canvasConnections, setCanvasConnections] = useState<Connection[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    // Only update if the notes array reference has changed and the content is different
    if (JSON.stringify(canvasNotes) !== JSON.stringify(notes)) {
      setCanvasNotes(notes);
    }
  }, [notes]);

  useEffect(() => {
    // Only update if the connections array reference has changed and the content is different
    if (JSON.stringify(canvasConnections) !== JSON.stringify(connections)) {
      setCanvasConnections(connections);
    }
  }, [connections]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking on empty canvas
    if (e.target === canvasRef.current) {
      setSelectedNote(null);
      setConnectingFrom(null);
    }
  };

  // Add a new post-it note to the canvas
  const addNote = () => {
    // Generate a random position within the visible canvas area
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const randomX = canvasRect
      ? Math.random() * (canvasRect.width - 200) + 50
      : 100;
    const randomY = canvasRect
      ? Math.random() * (canvasRect.height - 200) + 50
      : 100;

    // Generate a random color from a predefined set of post-it note colors
    const colors = [
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote: PostItNoteData = {
      id: `note-${Date.now()}`,
      title: "Untitled Page",
      description: "Add page description here",
      color: randomColor,
      position: { x: randomX, y: randomY },
      zIndex: 1,
    };

    const updatedNotes = [...canvasNotes, newNote];
    setCanvasNotes(updatedNotes);
    setSelectedNote(newNote.id); // Select the newly created note
    onNotesChange(updatedNotes);
  };

  const handleNoteMove = (id: string, position: Position) => {
    const updatedNotes = canvasNotes.map((note) =>
      note.id === id ? { ...note, position } : note,
    );
    setCanvasNotes(updatedNotes);
    onNotesChange(updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === id);
    if (updatedNote) {
      onUpdateNote(updatedNote);
    }
  };

  const handleNoteSelect = (id: string) => {
    setSelectedNote(id);

    // If we're in connecting mode, create a connection
    if (connectingFrom && connectingFrom !== id) {
      const newConnection = { from: connectingFrom, to: id };
      const updatedConnections = [...canvasConnections, newConnection];
      setCanvasConnections(updatedConnections);
      onConnectionsChange(updatedConnections);
      setConnectingFrom(null);
    }
  };

  const handleNoteEdit = (
    id: string,
    content: { title: string; description: string },
  ) => {
    const updatedNotes = canvasNotes.map((note) =>
      note.id === id
        ? { ...note, title: content.title, description: content.description }
        : note,
    );
    setCanvasNotes(updatedNotes);
    onNotesChange(updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === id);
    if (updatedNote) {
      onUpdateNote(updatedNote);
    }
  };

  const handleNoteDelete = (id: string) => {
    const updatedNotes = canvasNotes.filter((note) => note.id !== id);
    const updatedConnections = canvasConnections.filter(
      (conn) => conn.from !== id && conn.to !== id,
    );

    setCanvasNotes(updatedNotes);
    setCanvasConnections(updatedConnections);
    onNotesChange(updatedNotes);
    onConnectionsChange(updatedConnections);
    onDeleteNote(id);

    if (selectedNote === id) {
      setSelectedNote(null);
    }
    if (connectingFrom === id) {
      setConnectingFrom(null);
    }
  };

  const startConnection = (id: string) => {
    setConnectingFrom(id);
  };

  const renderConnections = () => {
    return canvasConnections.map((connection, index) => {
      const fromNote = canvasNotes.find((note) => note.id === connection.from);
      const toNote = canvasNotes.find((note) => note.id === connection.to);

      if (!fromNote || !toNote) return null;

      const fromX = fromNote.position.x + 100; // Assuming note width is 200px
      const fromY = fromNote.position.y + 100; // Assuming note height is 200px
      const toX = toNote.position.x + 100;
      const toY = toNote.position.y + 100;

      return (
        <svg
          key={`connection-${index}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke="#333"
            strokeWidth="2"
            strokeDasharray={connectingFrom ? "5,5" : "none"}
          />
          {/* Arrow head */}
          <polygon
            points={`${toX},${toY} ${toX - 10},${toY - 5} ${toX - 10},${toY + 5}`}
            fill="#333"
            transform={`rotate(${Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI)}, ${toX}, ${toY})`}
          />
        </svg>
      );
    });
  };

  // Render temporary connection line when creating a new connection
  const renderTempConnection = () => {
    if (!connectingFrom) return null;

    const fromNote = canvasNotes.find((note) => note.id === connectingFrom);
    if (!fromNote) return null;

    const fromX = fromNote.position.x + 100;
    const fromY = fromNote.position.y + 100;

    // Use mouse position for the end point
    const toX = dragOffset.x;
    const toY = dragOffset.y;

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#333"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  React.useEffect(() => {
    // Remove the event listeners that reference undefined functions
    // We'll implement proper panning functionality later if needed
    if (isDragging) {
      // Add any necessary event listeners here
    } else {
      // Remove any necessary event listeners here
    }

    return () => {
      // Clean up any event listeners here
    };
  }, [isDragging]);

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setScale((prevScale) => {
          const newScale = Math.max(0.5, Math.min(2, prevScale + delta));
          return newScale;
        });
      }
    };

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gray-100 border border-gray-300 rounded-md"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
    >
      {/* Add Note Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent canvas click handler from firing
            addNote();
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 1C7.77614 1 8 1.22386 8 1.5V13.5C8 13.7761 7.77614 14 7.5 14C7.22386 14 7 13.7761 7 13.5V1.5C7 1.22386 7.22386 1 7.5 1Z"
              fill="currentColor"
            />
            <path
              d="M1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5Z"
              fill="currentColor"
            />
          </svg>
          Add Note
        </button>
      </div>

      {/* Render connections between notes */}
      {renderConnections()}
      {renderTempConnection()}

      {/* Render all post-it notes */}
      {canvasNotes.map((note) => (
        <PostItNote
          key={note.id}
          id={note.id}
          title={note.title}
          description={note.description}
          position={note.position}
          color={note.color}
          zIndex={note.zIndex}
          isSelected={selectedNote === note.id}
          isConnecting={connectingFrom === note.id}
          onMove={handleNoteMove}
          onSelect={handleNoteSelect}
          onContentChange={handleNoteEdit}
          onDelete={handleNoteDelete}
          onConnect={() => {}}
          onStartConnection={startConnection}
        />
      ))}

      {/* Canvas is empty state */}
      {canvasNotes.length === 0 && (
        <div className="flex items-center justify-center w-full h-full text-gray-500">
          <div className="text-center">
            <p className="text-xl">Your canvas is empty</p>
            <p className="mt-2">
              Add a new note from the toolbar to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
