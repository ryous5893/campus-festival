const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");
const seed = require("../assets/seed.js");

test("cancelling an approved application frees its venue and keeps other reservations", () => {
  const state = structuredClone(seed);
  const application = state.applications.find((a) => a.id === "A01");
  const reservation = state.reservations.find((r) => r.applicationId === application.id);
  const otherReservations = structuredClone(state.reservations.filter((r) => r.applicationId !== application.id));
  const candidate = { ...reservation, id: "new", start: "10:30", end: "11:30" };
  const usage = D.venueUsage(state, reservation.venueId);
  assert.equal(D.venueConflict(state, candidate), true);

  D.cancelApplication(state, application.id);

  assert.equal(application.status, "cancelled");
  assert.equal(reservation.status, "cancelled");
  assert.equal(D.venueConflict(state, candidate), false);
  assert.equal(D.venueUsage(state, reservation.venueId), usage - 1);
  assert.deepEqual(state.reservations.filter((r) => r.applicationId !== application.id), otherReservations);
  assert.equal(JSON.parse(JSON.stringify(state)).reservations.find((r) => r.id === reservation.id).status, "cancelled");
});

test("cancellation affects all linked reservations and ignores missing applications", () => {
  const state = structuredClone(seed);
  const linked = state.reservations.find((r) => r.applicationId === "A01");
  state.reservations.push({ ...linked, id: "extra" });
  const before = structuredClone(state);
  D.cancelApplication(state, "missing");
  assert.deepEqual(state, before);
  D.cancelApplication(state, "A01");
  D.cancelApplication(state, "A01");
  assert.ok(state.reservations.filter((r) => r.applicationId === "A01").every((r) => r.status === "cancelled"));
});
