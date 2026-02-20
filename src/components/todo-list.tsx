"use client";

import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

type Props = {
  todos: Todo[];
  loading: boolean;
  pendingIds: Set<number>;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
};

export function TodoList({ todos, loading, pendingIds, onToggle, onDelete, onEdit }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        No todos here!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          pending={pendingIds.has(todo.id)}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
