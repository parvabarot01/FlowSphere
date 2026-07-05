import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "hunter2" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "hunter2" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    const result = signupSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    const result = signupSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = signupSchema.safeParse({ fullName: "", email: "ada@example.com", password: "supersecret" });
    expect(result.success).toBe(false);
  });
});
