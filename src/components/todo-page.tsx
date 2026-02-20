"use client";

import { useState, useEffect } from "react";
import { TodoHeader } from "@/components/todo-header";
import { TodoFilter } from "@/components/todo-filter";
import { TodoList } from "@/components/todo-list";
import type { Todo, Filter } from "@/types/todo";

const STORAGE_KEY = "todos";

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setMounted(true);
  }, []);

  function updateTodos(next: Todo[]) {
    setTodos(next);
    saveTodos(next);
  }

  function handleAdd(title: string) {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    updateTodos([todo, ...todos]);
  }

  function handleToggle(id: number, completed: boolean) {
    updateTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed, updatedAt: new Date().toISOString() } : t
      )
    );
  }

  function handleDelete(id: number) {
    updateTodos(todos.filter((t) => t.id !== id));
  }

  function handleEdit(id: number, title: string) {
    updateTodos(
      todos.map((t) =>
        t.id === id ? { ...t, title, updatedAt: new Date().toISOString() } : t
      )
    );
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10 px-4">
      <TodoHeader onAdd={handleAdd} />
      <div className="flex items-center justify-between">
        <TodoFilter filter={filter} todos={todos} onFilterChange={setFilter} />
      </div>
      <TodoList
        todos={filtered}
        loading={!mounted}
        pendingIds={new Set()}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
