const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");
const seed = require("../assets/seed.js");

test("adjacent reservations are allowed, but overlapping intervals conflict", () => {
  const state = structuredClone(seed);
  const existing = state.reservations.find((r) => r.applicationId === "A01");
  state.reservations = [existing];
  const candidate = (start, end) => ({ ...existing, id: "new", start, end });
  for (const [start, end, conflict] of [
    ["12:00", "13:00", false],
    ["09:00", "10:00", false],
    ["11:59", "13:00", true],
    ["09:00", "10:01", true],
    ["10:00", "12:00", true],
    ["10:30", "11:30", true],
    ["09:00", "13:00", true],
  ]) assert.equal(D.venueConflict(state, candidate(start, end)), conflict, `${start}-${end}`);
});

test("cancelled reservations, other venues and dates, and the edited reservation do not conflict", () => {
  const existing = { id: "R1", venueId: "V1", date: "2026-11-14", start: "10:00", end: "12:00", status: "approved" };
  const candidate = { ...existing, id: "R2", start: "11:00", end: "11:30" };
  for (const row of [
    { ...existing, status: "cancelled" },
    { ...existing, venueId: "V2" },
    { ...existing, date: "2026-11-15" },
    { ...existing, id: candidate.id },
  ]) assert.equal(D.venueConflict({ reservations: [row] }, candidate), false);
  assert.equal(D.venueConflict({ reservations: [existing] }, candidate), true);
});
