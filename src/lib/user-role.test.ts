import { describe, expect, it } from "vitest";
import { formatUserRole } from "./user-role";

describe("formatUserRole", () => {
  it.each([
    ["ADMIN", "Admin"],
    ["FARMER", "Farmer"],
    ["FIELD_OFFICER", "Field Officer"],
  ] as const)("renders %s from the backend without inference", (role, label) => {
    expect(formatUserRole(role)).toBe(label);
  });

  it("does not default a missing role to Admin", () => {
    expect(formatUserRole(null)).toBe("Not available");
  });
});
