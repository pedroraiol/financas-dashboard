import { describe, expect, it } from "vitest";
import { parseBackupFile } from "./backup";

function validPayload() {
  return {
    version: 1,
    exportedAt: "2026-03-01T00:00:00.000Z",
    incomeSources: [
      {
        id: "i1",
        name: "Salário",
        amount: 5000,
        category: "salario",
        startDate: "2026-01-01",
        endDate: null,
        active: true,
      },
    ],
    fixedExpenses: [
      {
        id: "f1",
        name: "Aluguel",
        amount: 1500,
        category: "moradia",
        startDate: "2026-01-01",
        endDate: null,
        active: true,
      },
    ],
    variableExpenses: [
      {
        id: "v1",
        name: "Mercado",
        amount: 300,
        category: "alimentacao",
        date: "2026-03-10",
      },
    ],
    settings: {
      currency: "BRL",
      theme: "system",
      monthlySavingsGoal: null,
      onboardingComplete: true,
    },
  };
}

describe("parseBackupFile", () => {
  it("accepts a well-formed backup", () => {
    const result = parseBackupFile(JSON.stringify(validPayload()));
    expect(result).not.toBeNull();
    expect(result?.incomeSources).toHaveLength(1);
  });

  it("rejects invalid JSON", () => {
    expect(parseBackupFile("{not json")).toBeNull();
  });

  it("rejects a JSON array at the top level", () => {
    expect(parseBackupFile("[]")).toBeNull();
  });

  it("rejects an unknown category", () => {
    const payload = validPayload();
    payload.incomeSources[0].category = "criptomoedas";
    expect(parseBackupFile(JSON.stringify(payload))).toBeNull();
  });

  it("rejects a malformed date", () => {
    const payload = validPayload();
    payload.incomeSources[0].startDate = "01/01/2026";
    expect(parseBackupFile(JSON.stringify(payload))).toBeNull();
  });

  it("rejects a negative amount", () => {
    const payload = validPayload();
    payload.fixedExpenses[0].amount = -100;
    expect(parseBackupFile(JSON.stringify(payload))).toBeNull();
  });

  it("rejects a payload missing the settings object", () => {
    const payload = validPayload();
    // @ts-expect-error - deliberately malformed input for the test
    delete payload.settings;
    expect(parseBackupFile(JSON.stringify(payload))).toBeNull();
  });

  it("rejects a file over the size limit", () => {
    const huge = "a".repeat(6 * 1024 * 1024);
    expect(parseBackupFile(huge)).toBeNull();
  });

  it("rejects a list with more items than the defensive cap", () => {
    const payload = validPayload();
    const base = payload.incomeSources[0];
    payload.incomeSources = Array.from({ length: 20_001 }, (_, i) => ({
      ...base,
      id: `i${i}`,
    }));
    expect(parseBackupFile(JSON.stringify(payload))).toBeNull();
  });

  it("falls back to now() when exportedAt is missing", () => {
    const payload = validPayload();
    // @ts-expect-error - deliberately malformed input for the test
    delete payload.exportedAt;
    const result = parseBackupFile(JSON.stringify(payload));
    expect(result?.exportedAt).toBeTruthy();
  });
});
