"use client";

import { useState, useEffect, useCallback } from "react";
import { TodoHeader } from "@/components/todo-header";
import { TodoFilter } from "@/components/todo-filter";
import { TodoList } from "@/components/todo-list";
import type { Todo, Filter } from "@/types/todo";

export function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    const data: Todo[] = await res.json();
    setTodos(data);
  }, []);

  useEffect(() => {
    fetchTodos().finally(() => setLoading(false));
  }, [fetchTodos]);

  function setPending(id: number, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  }

  async function handleAdd(title: string) {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const todo: Todo = await res.json();
      setTodos((prev) => [todo, ...prev]);
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    setPending(id, true);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    setPending(id, false);
  }

  async function handleDelete(id: number) {
    setPending(id, true);
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
    setPending(id, false);
  }

  async function handleEdit(id: number, title: string) {
    setPending(id, true);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    setPending(id, false);
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
        loading={loading}
        pendingIds={pendingIds}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
