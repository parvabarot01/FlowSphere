import { describe, it, expect } from "vitest";
import { slugify, withRandomSuffix } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and dashifies a normal name", () => {
    expect(slugify("Acme Inc")).toBe("acme-inc");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Hello, World! 2024")).toBe("hello-world-2024");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("--Acme--")).toBe("acme");
  });

  it("falls back to a default when the input has no usable characters", () => {
    expect(slugify("!!!")).toBe("org");
  });
});

describe("withRandomSuffix", () => {
  it("appends a suffix to the given slug", () => {
    const result = withRandomSuffix("acme");
    expect(result.startsWith("acme-")).toBe(true);
    expect(result.length).toBeGreaterThan("acme-".length);
  });
});
