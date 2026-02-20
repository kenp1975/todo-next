"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  onAdd: (title: string) => void;
};

export function TodoHeader({ onAdd }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    onAdd(title);
    setValue("");
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">My TODOs</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1"
        />
        <Button type="submit" disabled={!value.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </form>
    </div>
  );
}
