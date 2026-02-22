import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodoList } from "@/components/todo-list";
import type { Todo } from "@/types/todo";

function makeTodo(id: number, title: string, completed = false): Todo {
  return {
    id,
    title,
    completed,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

const defaultHandlers = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe("TodoList — ローディング状態", () => {
  it("loading=true のときスケルトンを 3 つ表示する", () => {
    const { container } = render(
      <TodoList
        todos={[]}
        loading={true}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(3);
  });

  it("loading=true のとき「No todos here!」を表示しない", () => {
    render(
      <TodoList
        todos={[]}
        loading={true}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    expect(screen.queryByText("No todos here!")).not.toBeInTheDocument();
  });
});

describe("TodoList — 空状態", () => {
  it("todos が空で loading=false のとき「No todos here!」を表示する", () => {
    render(
      <TodoList
        todos={[]}
        loading={false}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("No todos here!")).toBeInTheDocument();
  });

  it("todos が空のときスケルトンを表示しない", () => {
    const { container } = render(
      <TodoList
        todos={[]}
        loading={false}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(0);
  });
});

describe("TodoList — リスト表示", () => {
  it("todos の数だけタイトルを表示する", () => {
    const todos = [
      makeTodo(1, "牛乳を買う"),
      makeTodo(2, "卵を買う"),
      makeTodo(3, "パンを買う"),
    ];
    render(
      <TodoList
        todos={todos}
        loading={false}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("卵を買う")).toBeInTheDocument();
    expect(screen.getByText("パンを買う")).toBeInTheDocument();
  });

  it("todos がある場合は「No todos here!」を表示しない", () => {
    render(
      <TodoList
        todos={[makeTodo(1, "タスク")]}
        loading={false}
        pendingIds={new Set()}
        {...defaultHandlers}
      />
    );
    expect(screen.queryByText("No todos here!")).not.toBeInTheDocument();
  });

  it("pendingIds に含まれる todo のコンテナに opacity-50 がつく", () => {
    const todos = [makeTodo(1, "pending なタスク"), makeTodo(2, "通常タスク")];
    const { container } = render(
      <TodoList
        todos={todos}
        loading={false}
        pendingIds={new Set([1])}
        {...defaultHandlers}
      />
    );
    const items = container.querySelectorAll(".rounded-lg.border");
    expect(items[0]).toHaveClass("opacity-50");
    expect(items[1]).not.toHaveClass("opacity-50");
  });
});
