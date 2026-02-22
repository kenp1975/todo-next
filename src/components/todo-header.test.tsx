import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoHeader } from "@/components/todo-header";

describe("TodoHeader", () => {
  it("見出し「My TODOs」を表示する", () => {
    render(<TodoHeader onAdd={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "My TODOs" })).toBeInTheDocument();
  });

  it("プレースホルダーつきの入力フィールドを表示する", () => {
    render(<TodoHeader onAdd={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("What needs to be done?")
    ).toBeInTheDocument();
  });

  it("入力が空のとき Add ボタンが無効になる", () => {
    render(<TodoHeader onAdd={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("入力に文字を入力すると Add ボタンが有効になる", async () => {
    const user = userEvent.setup();
    render(<TodoHeader onAdd={vi.fn()} />);
    await user.type(screen.getByRole("textbox"), "牛乳を買う");
    expect(screen.getByRole("button", { name: /add/i })).toBeEnabled();
  });

  it("フォーム送信時に onAdd がトリミングされたタイトルで呼ばれる", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<TodoHeader onAdd={handleAdd} />);
    await user.type(screen.getByRole("textbox"), "  牛乳を買う  ");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(handleAdd).toHaveBeenCalledOnce();
    expect(handleAdd).toHaveBeenCalledWith("牛乳を買う");
  });

  it("送信後に入力フィールドがクリアされる", async () => {
    const user = userEvent.setup();
    render(<TodoHeader onAdd={vi.fn()} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "タスク");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(input).toHaveValue("");
  });

  it("空白のみの入力では onAdd が呼ばれない", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<TodoHeader onAdd={handleAdd} />);
    await user.type(screen.getByRole("textbox"), "   ");
    // 空白だけなので Add ボタンは disabled のままで呼ばれない
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it("Enter キーでフォームを送信できる", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<TodoHeader onAdd={handleAdd} />);
    await user.type(screen.getByRole("textbox"), "タスク{Enter}");
    expect(handleAdd).toHaveBeenCalledWith("タスク");
  });

  it("入力が空のままフォームを直接送信しても onAdd は呼ばれない", () => {
    // ボタンは disabled で通常到達不能だが、フォームを直接 submit することで
    // handleSubmit 内の if (!title) return ガード節を通過させる
    const handleAdd = vi.fn();
    render(<TodoHeader onAdd={handleAdd} />);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.submit(form);
    expect(handleAdd).not.toHaveBeenCalled();
  });
});
