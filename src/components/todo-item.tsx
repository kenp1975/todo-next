"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  pending?: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
};

export function TodoItem({ todo, pending, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    setValue(todo.title);
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setValue(todo.title);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm transition-opacity",
        pending && "opacity-50 pointer-events-none"
      )}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
        aria-label="Toggle todo"
      />

      {editing ? (
        <>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 flex-1 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={commitEdit}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 text-sm cursor-pointer select-none",
              todo.completed && "line-through text-muted-foreground"
            )}
            onDoubleClick={startEdit}
          >
            {todo.title}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
