import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, X, Link as LinkIcon } from "lucide-react";

interface NoteProps {
  id?: string;
  title?: string;
  description?: string;
  color?: string;
  position?: { x: number; y: number };
  isSelected?: boolean;
  isConnecting?: boolean;
  zIndex?: number;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
  onConnect?: (id: string) => void;
  onContentChange?: (
    id: string,
    content: { title: string; description: string },
  ) => void;
  onSelect?: (id: string) => void;
  onStartConnection?: (id: string) => void;
}

const Note: React.FC<NoteProps> = ({
  id = "note-" + Math.random().toString(36).substr(2, 9),
  title = "Untitled Page",
  description = "Add page description here",
  color = "#FFEB3B",
  position = { x: 100, y: 100 },
  isSelected = false,
  isConnecting = false,
  zIndex = 1,
  onMove = () => {},
  onDelete = () => {},
  onConnect = () => {},
  onContentChange = () => {},
  onSelect = () => {},
  onStartConnection = () => {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteDescription, setNoteDescription] = useState(description);
  const [notePosition, setNotePosition] = useState(position);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  const handleSelect = () => {
    onSelect(id);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (isDragging && noteRef.current) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      setNotePosition({ x: newX, y: newY });
      onMove(id, { x: newX, y: newY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNoteTitle(newTitle);
    onContentChange(id, { title: newTitle, description: noteDescription });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newDescription = e.target.value;
    setNoteDescription(newDescription);
    onContentChange(id, { title: noteTitle, description: newDescription });
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const handleConnect = () => {
    onConnect(id);
    onStartConnection(id);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging]);

  return (
    <Card
      ref={noteRef}
      className="absolute w-48 h-48 shadow-lg rounded-md overflow-hidden flex flex-col bg-background"
      style={{
        left: `${notePosition.x}px`,
        top: `${notePosition.y}px`,
        borderTop: `4px solid ${color}`,
        cursor: isDragging ? "grabbing" : "default",
        zIndex: isDragging ? 10 : isSelected ? 5 : zIndex,
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f6, 0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          : "",
        outline: isConnecting ? "2px dashed #3b82f6" : "none",
      }}
      onClick={handleSelect}
    >
      <div
        className="p-2 flex justify-between items-center bg-muted/30 cursor-grab"
        onMouseDown={handleDragStart}
      >
        <GripVertical size={16} className="text-muted-foreground" />
        <div className="flex gap-1">
          <button
            onClick={handleConnect}
            className="p-1 hover:bg-muted rounded-sm"
            title="Connect to another note"
          >
            <LinkIcon size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-muted rounded-sm"
            title="Delete note"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col overflow-hidden">
        <Input
          value={noteTitle}
          onChange={handleTitleChange}
          className="mb-2 font-medium border-none p-0 h-auto text-sm focus-visible:ring-0"
          placeholder="Page Title"
        />
        <Textarea
          value={noteDescription}
          onChange={handleDescriptionChange}
          className="flex-1 resize-none border-none p-0 text-xs focus-visible:ring-0"
          placeholder="Page Description"
        />
      </div>
    </Card>
  );
};

export default Note;
