import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcApprovalRate,
  getDistrictColorCategory,
} from "./utils.js";
import { normalizeDistrictName } from "./district-coords.js";

describe("approval rate", () => {
  it("calculates Bhopal at 50%", () => {
    assert.equal(calcApprovalRate(4, 8), 50);
  });

  it("handles division by zero", () => {
    assert.equal(calcApprovalRate(0, 0), 0);
  });
});

describe("district color category", () => {
  it("marks Bhopal as moderate (50%)", () => {
    const d = { anomaly: false, claims_approved: 4, claims_filed: 8 };
    assert.equal(getDistrictColorCategory(d), "moderate");
  });

  it("marks Dewas as good (100%)", () => {
    const d = { anomaly: false, claims_approved: 1, claims_filed: 1 };
    assert.equal(getDistrictColorCategory(d), "good");
  });

  it("marks Burhanpur as anomaly regardless of rate", () => {
    const d = { anomaly: true, claims_approved: 1, claims_filed: 4 };
    assert.equal(getDistrictColorCategory(d), "anomaly");
  });

  it("marks low approval as low when not anomaly", () => {
    const d = { anomaly: false, claims_approved: 1, claims_filed: 10 };
    assert.equal(getDistrictColorCategory(d), "low");
  });
});

describe("district name normalization", () => {
  it("normalizes East Nimar to khandwa", () => {
    assert.equal(normalizeDistrictName("East Nimar"), "khandwa");
  });

  it("normalizes West Nimar to khargone", () => {
    assert.equal(normalizeDistrictName("West Nimar"), "khargone");
  });

  it("trims and lowercases", () => {
    assert.equal(normalizeDistrictName("  Bhopal  "), "bhopal");
  });
});
