import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoPage } from "@/components/todo-page";
import type { Todo } from "@/types/todo";

const STORAGE_KEY = "todos";

function setStorageTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getStorageTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function makeTodo(id: number, title: string, completed = false): Todo {
  return {
    id,
    title,
    completed,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

// マウント後のローディング完了を待つヘルパー
async function renderAndWaitMounted() {
  render(<TodoPage />);
  // loading=false になると skeleton が消えて "No todos here!" か TodoItem が現れる
  await waitFor(() => {
    expect(screen.queryByText(/no todos here/i)).not.toBeNull() ||
      expect(screen.queryAllByRole("checkbox").length).toBeGreaterThan(0);
  });
}

describe("TodoPage — 初期表示", () => {
  it("localStorage が空のとき「No todos here!」を表示する", async () => {
    await renderAndWaitMounted();
    expect(screen.getByText("No todos here!")).toBeInTheDocument();
  });

  it("localStorage に保存済みの TODO を読み込んで表示する", async () => {
    setStorageTodos([
      makeTodo(1, "牛乳を買う"),
      makeTodo(2, "卵を買う"),
    ]);
    render(<TodoPage />);
    await waitFor(() => {
      expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    });
    expect(screen.getByText("卵を買う")).toBeInTheDocument();
  });

  it("localStorage に不正なデータがあっても空リストで表示する", async () => {
    localStorage.setItem(STORAGE_KEY, "invalid json{{");
    await renderAndWaitMounted();
    expect(screen.getByText("No todos here!")).toBeInTheDocument();
  });
});

describe("TodoPage — TODO 追加", () => {
  it("入力して Add を押すとリストに追加される", async () => {
    const user = userEvent.setup();
    await renderAndWaitMounted();
    await user.type(screen.getByPlaceholderText("What needs to be done?"), "新しいタスク");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByText("新しいタスク")).toBeInTheDocument();
  });

  it("追加した TODO が localStorage に保存される", async () => {
    const user = userEvent.setup();
    await renderAndWaitMounted();
    await user.type(screen.getByPlaceholderText("What needs to be done?"), "保存テスト");
    await user.click(screen.getByRole("button", { name: /add/i }));
    const stored = getStorageTodos();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("保存テスト");
    expect(stored[0].completed).toBe(false);
  });

  it("追加した TODO はリストの先頭に表示される", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(100, "既存タスク")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("既存タスク")).toBeInTheDocument());
    await user.type(screen.getByPlaceholderText("What needs to be done?"), "新しいタスク");
    await user.click(screen.getByRole("button", { name: /add/i }));
    const titles = screen.getAllByRole("checkbox").map(
      (cb) => cb.closest("[class*='rounded-lg']")?.textContent
    );
    // 新しいほうが先
    expect(titles[0]).toContain("新しいタスク");
    expect(titles[1]).toContain("既存タスク");
  });
});

describe("TodoPage — 完了トグル", () => {
  it("チェックボックスをクリックすると completed が反転する", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "牛乳を買う", false)]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("牛乳を買う")).toBeInTheDocument());
    const checkbox = screen.getByRole("checkbox", { name: "Toggle todo" });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("トグル後の状態が localStorage に保存される", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "牛乳を買う", false)]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("牛乳を買う")).toBeInTheDocument());
    await user.click(screen.getByRole("checkbox", { name: "Toggle todo" }));
    const stored = getStorageTodos();
    expect(stored[0].completed).toBe(true);
  });

  it("2件あるとき、1件だけトグルしてもう1件は変わらない", async () => {
    // todos.map() の非一致側 (`: t`) を通過させる
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "todo-A", false), makeTodo(2, "todo-B", false)]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("todo-A")).toBeInTheDocument());
    const checkboxes = screen.getAllByRole("checkbox", { name: "Toggle todo" });
    await user.click(checkboxes[0]); // todo-A だけトグル
    const stored = getStorageTodos();
    expect(stored.find((t) => t.id === 1)?.completed).toBe(true);
    expect(stored.find((t) => t.id === 2)?.completed).toBe(false); // 非一致側は変化なし
  });
});

describe("TodoPage — TODO 削除", () => {
  it("2件あるとき1件削除すると残り1件はリストに残る", async () => {
    // todos.filter() の true 側 (残す todo) を通過させる
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "残るタスク"), makeTodo(2, "消えるタスク")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("消えるタスク")).toBeInTheDocument());
    const todoContainer = screen.getByText("消えるタスク").closest(".rounded-lg") as HTMLElement;
    const [, deleteButton] = within(todoContainer).getAllByRole("button");
    await user.click(deleteButton);
    expect(screen.queryByText("消えるタスク")).not.toBeInTheDocument();
    expect(screen.getByText("残るタスク")).toBeInTheDocument(); // filter の true 側
    expect(getStorageTodos()).toHaveLength(1);
  });

  it("削除ボタンをクリックするとリストから消える", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "消えるタスク")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("消えるタスク")).toBeInTheDocument());
    // TodoItem コンテナ内に絞り込んでボタンを取得
    const todoContainer = screen.getByText("消えるタスク").closest(".rounded-lg") as HTMLElement;
    const [, deleteButton] = within(todoContainer).getAllByRole("button");
    await user.click(deleteButton);
    expect(screen.queryByText("消えるタスク")).not.toBeInTheDocument();
    expect(screen.getByText("No todos here!")).toBeInTheDocument();
  });

  it("削除後に localStorage から取り除かれる", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "消えるタスク")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("消えるタスク")).toBeInTheDocument());
    const todoContainer = screen.getByText("消えるタスク").closest(".rounded-lg") as HTMLElement;
    const [, deleteButton] = within(todoContainer).getAllByRole("button");
    await user.click(deleteButton);
    expect(getStorageTodos()).toHaveLength(0);
  });
});

describe("TodoPage — インライン編集", () => {
  it("2件あるとき1件だけ編集してもう1件は変わらない", async () => {
    // todos.map() の非一致側 (`: t`) を通過させる
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "編集するタスク"), makeTodo(2, "触らないタスク")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("編集するタスク")).toBeInTheDocument());
    const todoContainer = screen.getByText("編集するタスク").closest(".rounded-lg") as HTMLElement;
    const [editButton] = within(todoContainer).getAllByRole("button");
    await user.click(editButton);
    const editInput = within(todoContainer).getByRole("textbox");
    await user.clear(editInput);
    await user.type(editInput, "更新済みタスク");
    await user.keyboard("{Enter}");
    expect(screen.getByText("更新済みタスク")).toBeInTheDocument();
    expect(screen.getByText("触らないタスク")).toBeInTheDocument(); // 非一致側は変化なし
  });

  it("編集して確定するとタイトルが更新される", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "旧タイトル")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("旧タイトル")).toBeInTheDocument());
    // TodoItem コンテナ内に絞り込んでボタン・テキストボックスを操作
    const todoContainer = screen.getByText("旧タイトル").closest(".rounded-lg") as HTMLElement;
    const [editButton] = within(todoContainer).getAllByRole("button");
    await user.click(editButton);
    const editInput = within(todoContainer).getByRole("textbox");
    await user.clear(editInput);
    await user.type(editInput, "新タイトル");
    await user.keyboard("{Enter}");
    expect(screen.getByText("新タイトル")).toBeInTheDocument();
    expect(screen.queryByText("旧タイトル")).not.toBeInTheDocument();
  });

  it("編集後の内容が localStorage に保存される", async () => {
    const user = userEvent.setup();
    setStorageTodos([makeTodo(1, "旧タイトル")]);
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("旧タイトル")).toBeInTheDocument());
    const todoContainer = screen.getByText("旧タイトル").closest(".rounded-lg") as HTMLElement;
    const [editButton] = within(todoContainer).getAllByRole("button");
    await user.click(editButton);
    const editInput = within(todoContainer).getByRole("textbox");
    await user.clear(editInput);
    await user.type(editInput, "新タイトル");
    await user.keyboard("{Enter}");
    expect(getStorageTodos()[0].title).toBe("新タイトル");
  });
});

describe("TodoPage — フィルタリング", () => {
  beforeEach(() => {
    setStorageTodos([
      makeTodo(1, "未完了タスク", false),
      makeTodo(2, "完了タスク", true),
    ]);
  });

  it("All フィルターで全件表示される", async () => {
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("未完了タスク")).toBeInTheDocument());
    expect(screen.getByText("完了タスク")).toBeInTheDocument();
  });

  it("Active フィルターで未完了のみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("未完了タスク")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /active/i }));
    expect(screen.getByText("未完了タスク")).toBeInTheDocument();
    expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
  });

  it("Completed フィルターで完了済みのみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("未完了タスク")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /completed/i }));
    expect(screen.getByText("完了タスク")).toBeInTheDocument();
    expect(screen.queryByText("未完了タスク")).not.toBeInTheDocument();
  });

  it("フィルターのカウントが正しく表示される", async () => {
    render(<TodoPage />);
    await waitFor(() => expect(screen.getByText("未完了タスク")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /^all/i })).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: /active/i })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /completed/i })).toHaveTextContent("1");
  });
});
