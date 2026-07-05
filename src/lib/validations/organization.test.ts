import { describe, it, expect } from "vitest";
import { createOrganizationSchema } from "@/lib/validations/organization";

describe("createOrganizationSchema", () => {
  it("accepts a reasonable org name", () => {
    expect(createOrganizationSchema.safeParse({ name: "Acme Inc" }).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(createOrganizationSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(createOrganizationSchema.safeParse({ name: "A".repeat(61) }).success).toBe(false);
  });
});
