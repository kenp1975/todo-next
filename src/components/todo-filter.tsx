"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Filter, Todo } from "@/types/todo";

type Props = {
  filter: Filter;
  todos: Todo[];
  onFilterChange: (filter: Filter) => void;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoFilter({ filter, todos, onFilterChange }: Props) {
  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="flex gap-1">
      {FILTERS.map(({ value, label }) => (
        <Button
          key={value}
          variant={filter === value ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(value)}
          className="gap-2"
        >
          {label}
          <Badge
            variant={filter === value ? "secondary" : "outline"}
            className="h-5 min-w-5 justify-center px-1.5 text-xs"
          >
            {counts[value]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
