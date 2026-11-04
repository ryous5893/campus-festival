const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");
const seed = require("../assets/seed.js");

function addGroup(state, name) {
  const id = D.nextId(state.groups, "G");
  state.groups.push({ id, name, representative: "代表", members: 1, budget: 1000 });
  return id;
}

test("adding a group after deleting another never duplicates an existing id", () => {
  const state = structuredClone(seed);
  const first = addGroup(state, "追加団体A");
  addGroup(state, "追加団体B");
  assert.equal(D.deleteGroup(state, first), true);

  addGroup(state, "追加団体C");

  const ids = state.groups.map((g) => g.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("ids continue from the largest number, including past two digits", () => {
  assert.equal(D.nextId(seed.groups, "G"), "G07");
  assert.equal(D.nextId([], "G"), "G01");
  assert.equal(D.nextId([{ id: "G02" }, { id: "G09" }], "G"), "G10");
  assert.equal(D.nextId([{ id: "G99" }], "G"), "G100");
});

test("reservations created by approval also avoid existing ids", () => {
  const state = structuredClone(seed);
  state.reservations = state.reservations.filter((r) => r.id !== "R01");
  const application = state.applications.find((a) => a.status === "submitted");

  D.approve(state, application.id);

  const ids = state.reservations.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});
