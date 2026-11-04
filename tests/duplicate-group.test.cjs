const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("group names with leading or trailing whitespace are duplicates", () => {
  const state = { groups: [{ id: "G1", name: " 団体A　" }, { id: "G2", name: "団体B" }] };
  assert.equal(D.duplicateGroup(state, "団体A", "new"), true);
  assert.equal(D.duplicateGroup(state, "　団体B ", "new"), true);
  assert.equal(D.duplicateGroup(state, "団体A", "G1"), false);
  assert.equal(D.duplicateGroup(state, "団体C", "new"), false);
});
