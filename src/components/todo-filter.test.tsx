import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoFilter } from "@/components/todo-filter";
import type { Todo, Filter } from "@/types/todo";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: Date.now(),
    title: "テストTODO",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("TodoFilter", () => {
  it("All / Active / Completed の 3 つのボタンを表示する", () => {
    render(
      <TodoFilter filter="all" todos={[]} onFilterChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /completed/i })).toBeInTheDocument();
  });

  it("todos が空のとき全カウントが 0 になる", () => {
    render(
      <TodoFilter filter="all" todos={[]} onFilterChange={vi.fn()} />
    );
    // All ボタンのバッジに 0 が表示される
    const allButton = screen.getByRole("button", { name: /all/i });
    expect(allButton).toHaveTextContent("0");
  });

  it("todos の内容に応じてカウントが正しく表示される", () => {
    const todos = [
      makeTodo({ id: 1, completed: false }),
      makeTodo({ id: 2, completed: false }),
      makeTodo({ id: 3, completed: true }),
    ];
    render(
      <TodoFilter filter="all" todos={todos} onFilterChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /all/i })).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: /active/i })).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: /completed/i })).toHaveTextContent("1");
  });

  it("All ボタンクリックで onFilterChange('all') が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TodoFilter filter="completed" todos={[]} onFilterChange={handleChange} />
    );
    await user.click(screen.getByRole("button", { name: /^all/i }));
    expect(handleChange).toHaveBeenCalledWith("all");
  });

  it("Active ボタンクリックで onFilterChange('active') が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TodoFilter filter="all" todos={[]} onFilterChange={handleChange} />
    );
    await user.click(screen.getByRole("button", { name: /active/i }));
    expect(handleChange).toHaveBeenCalledWith("active");
  });

  it("Completed ボタンクリックで onFilterChange('completed') が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TodoFilter filter="all" todos={[]} onFilterChange={handleChange} />
    );
    await user.click(screen.getByRole("button", { name: /completed/i }));
    expect(handleChange).toHaveBeenCalledWith("completed");
  });

  it("全件完了のとき active カウントが 0 になる", () => {
    const todos = [
      makeTodo({ id: 1, completed: true }),
      makeTodo({ id: 2, completed: true }),
    ];
    render(
      <TodoFilter filter="all" todos={todos} onFilterChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /active/i })).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: /completed/i })).toHaveTextContent("2");
  });
});
