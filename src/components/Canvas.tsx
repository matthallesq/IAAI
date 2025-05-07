import React, { useState, useRef, useEffect } from "react";
import { PostItNote as Note, Connection } from "@/hooks/useSiteMapData";
import PostItNote from "./PostItNote";

interface CanvasProps {
  notes: Note[];
  connections: Connection[];
  onNotesChange?: (notes: Note[]) => void;
  onConnectionsChange?: (connections: Connection[]) => void;
  onUpdateNote?: (note: Note) => void;
  onDeleteNote?: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  notes = [],
  connections = [],
  onNotesChange,
  onConnectionsChange,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle note dragging
  const handleNoteMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedNoteId(noteId);

    const note = notes.find((n) => n.id === noteId);
    if (note) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Handle canvas mouse down for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDragging) {
      // Left mouse button
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for both dragging notes and panning
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && draggedNoteId) {
      const updatedNotes = notes.map((note) => {
        if (note.id === draggedNoteId) {
          // Calculate new position considering scale and canvas position
          const newX = (e.clientX - dragOffset.x - position.x) / scale;
          const newY = (e.clientY - dragOffset.y - position.y) / scale;

          return {
            ...note,
            position: { x: newX, y: newY },
          };
        }
        return note;
      });

      onNotesChange?.(updatedNotes);
    } else if (isPanning) {
      const dx = e.clientX - startPanPosition.x;
      const dy = e.clientY - startPanPosition.y;

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setStartPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop dragging or panning
  const handleMouseUp = () => {
    if (isDragging && draggedNoteId) {
      setIsDragging(false);
      setDraggedNoteId(null);
    }

    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    setScale(newScale);
  };

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (canvasElement) {
        canvasElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [
    isDragging,
    draggedNoteId,
    dragOffset,
    isPanning,
    startPanPosition,
    scale,
    position,
    notes,
  ]);

  // Add a new note
  const handleAddNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "New Note",
      description: "Add description here",
      color: "#ffcc80",
      position: { x: 100, y: 100 },
      zIndex: notes.length + 1,
    };

    onNotesChange?.([...notes, newNote]);
  };

  // Update a note
  const handleUpdateNote = (updatedNote: Note) => {
    if (onUpdateNote) {
      onUpdateNote(updatedNote);
    } else {
      const updatedNotes = notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note,
      );
      onNotesChange?.(updatedNotes);
    }
  };

  // Delete a note
  const handleDeleteNote = (id: string) => {
    if (onDeleteNote) {
      onDeleteNote(id);
    } else {
      const updatedNotes = notes.filter((note) => note.id !== id);
      onNotesChange?.(updatedNotes);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      <div className="absolute top-2 right-2 z-10">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          onClick={handleAddNote}
        >
          Add Note
        </button>
        <div className="mt-2 flex gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md text-sm"
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
          >
            +
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md text-sm"
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
          >
            -
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-md text-sm"
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        style={{ touchAction: "none" }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: "transform 0.1s ease-out",
          }}
        >
          {notes.map((note) => (
            <PostItNote
              key={note.id}
              note={note}
              onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}

          {/* Connections would be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
