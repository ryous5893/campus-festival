const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("remaining budget respects zero and only subtracts the group's expenses", () => {
  const state = {
    groups: [{ id: "zero", budget: 0 }, { id: "other", budget: 1000 }, { id: "missing" }],
    expenses: [{ groupId: "zero", amount: 100 }, { groupId: "other", amount: 300 }],
  };
  assert.equal(D.remaining({ ...state, expenses: [] }, "zero"), 0);
  assert.equal(D.remaining(state, "zero"), -100);
  assert.equal(D.remaining(state, "other"), 700);
  assert.equal(D.remaining(state, "missing"), 50000);
});
