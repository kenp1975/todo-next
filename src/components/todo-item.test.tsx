import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

const baseTodo: Todo = {
  id: 1,
  title: "牛乳を買う",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const defaultProps = {
  todo: baseTodo,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe("TodoItem — 表示", () => {
  it("タイトルを表示する", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });

  it("未完了のとき line-through クラスがつかない", () => {
    render(<TodoItem {...defaultProps} />);
    const title = screen.getByText("牛乳を買う");
    expect(title).not.toHaveClass("line-through");
  });

  it("完了済みのとき line-through クラスがつく", () => {
    render(
      <TodoItem {...defaultProps} todo={{ ...baseTodo, completed: true }} />
    );
    const title = screen.getByText("牛乳を買う");
    expect(title).toHaveClass("line-through");
  });

  it("未完了のとき checkbox が unchecked", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByRole("checkbox", { name: "Toggle todo" })).not.toBeChecked();
  });

  it("完了済みのとき checkbox が checked", () => {
    render(
      <TodoItem {...defaultProps} todo={{ ...baseTodo, completed: true }} />
    );
    expect(screen.getByRole("checkbox", { name: "Toggle todo" })).toBeChecked();
  });

  it("pending=true のとき opacity-50 クラスがコンテナに付く", () => {
    const { container } = render(<TodoItem {...defaultProps} pending={true} />);
    expect(container.firstChild).toHaveClass("opacity-50");
  });

  it("pending=false のとき opacity-50 クラスがコンテナにつかない", () => {
    const { container } = render(<TodoItem {...defaultProps} pending={false} />);
    expect(container.firstChild).not.toHaveClass("opacity-50");
  });
});

describe("TodoItem — チェックボックス操作", () => {
  it("チェックボックスをクリックすると onToggle が (id, true) で呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TodoItem {...defaultProps} onToggle={onToggle} />);
    await user.click(screen.getByRole("checkbox", { name: "Toggle todo" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it("完了済み TODO のチェックボックスをクリックすると onToggle が (id, false) で呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        {...defaultProps}
        todo={{ ...baseTodo, completed: true }}
        onToggle={onToggle}
      />
    );
    await user.click(screen.getByRole("checkbox", { name: "Toggle todo" }));
    expect(onToggle).toHaveBeenCalledWith(1, false);
  });
});

describe("TodoItem — 削除", () => {
  it("削除ボタンをクリックすると onDelete が id で呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem {...defaultProps} onDelete={onDelete} />);
    // 表示モードのボタン: [編集ボタン, 削除ボタン]
    const [, deleteButton] = screen.getAllByRole("button");
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});

describe("TodoItem — インライン編集", () => {
  it("編集ボタンをクリックすると入力フィールドが表示される", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("牛乳を買う");
  });

  it("タイトルをダブルクリックすると編集モードに入る", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);
    await user.dblClick(screen.getByText("牛乳を買う"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("編集後に Enter を押すと onEdit が新しいタイトルで呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "卵を買う");
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledWith(1, "卵を買う");
  });

  it("確定ボタンをクリックすると onEdit が呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "卵を買う");
    // 編集モードのボタン: [確定, キャンセル]
    const [commitButton] = screen.getAllByRole("button");
    await user.click(commitButton);
    expect(onEdit).toHaveBeenCalledWith(1, "卵を買う");
  });

  it("タイトルが変わっていないとき onEdit は呼ばれない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    // 変更せずに Enter
    await user.keyboard("{Enter}");
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("空文字にして Enter を押しても onEdit は呼ばれない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    await user.clear(screen.getByRole("textbox"));
    await user.keyboard("{Enter}");
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("Escape キーで編集をキャンセルすると元のタイトルに戻る", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "変更するつもりのないテキスト");
    await user.keyboard("{Escape}");
    expect(onEdit).not.toHaveBeenCalled();
    // 入力フィールドが消えてタイトルに戻る
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("キャンセルボタンをクリックすると編集モードを抜けて onEdit は呼ばれない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    await user.type(screen.getByRole("textbox"), "変更テキスト");
    // 編集モードのボタン: [確定, キャンセル]
    const [, cancelButton] = screen.getAllByRole("button");
    await user.click(cancelButton);
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("入力値の前後の空白はトリミングされて onEdit に渡される", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    const [editButton] = screen.getAllByRole("button");
    await user.click(editButton);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "  卵を買う  ");
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledWith(1, "卵を買う");
  });
});
