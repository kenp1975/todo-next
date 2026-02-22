import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("単一のクラス名をそのまま返す", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("複数のクラス名をスペース区切りで結合する", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("falsy な値を除外する", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("条件付きクラス名を正しく適用する", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });

  it("Tailwind の競合するクラスは後勝ちで上書きされる", () => {
    // twMerge の動作: p-4 と p-2 が競合したら後者が勝つ
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("競合しない Tailwind クラスは両方残る", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("引数なしで空文字を返す", () => {
    expect(cn()).toBe("");
  });
});
