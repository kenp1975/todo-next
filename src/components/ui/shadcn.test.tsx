import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

describe("Badge — asChild 合成パターン", () => {
  it("asChild=true のとき子要素のタグでレンダリングされる", () => {
    // const Comp = asChild ? Slot.Root : "span" の true 側を通過
    render(
      <Badge asChild>
        <a href="#">リンクバッジ</a>
      </Badge>
    );
    const link = screen.getByRole("link", { name: "リンクバッジ" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  it("asChild=false（デフォルト）のとき span でレンダリングされる", () => {
    render(<Badge>通常バッジ</Badge>);
    const badge = screen.getByText("通常バッジ");
    expect(badge.tagName).toBe("SPAN");
  });
});

describe("Button — asChild 合成パターン", () => {
  it("asChild=true のとき子要素のタグでレンダリングされる", () => {
    // const Comp = asChild ? Slot.Root : "button" の true 側を通過
    render(
      <Button asChild>
        <a href="#">リンクボタン</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "リンクボタン" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  it("asChild=false（デフォルト）のとき button でレンダリングされる", () => {
    render(<Button>通常ボタン</Button>);
    const button = screen.getByRole("button", { name: "通常ボタン" });
    expect(button.tagName).toBe("BUTTON");
  });
});
