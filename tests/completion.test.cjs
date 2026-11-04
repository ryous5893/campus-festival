const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("completion rate handles empty and populated task lists", () => {
  assert.equal(D.completion({ tasks: [] }), 0);
  assert.equal(D.completion({ tasks: [{ status: "todo" }] }), 0);
  assert.equal(D.completion({ tasks: [{ status: "done" }] }), 100);
  assert.equal(D.completion({ tasks: [{ status: "done" }, { status: "todo" }, { status: "active" }] }), 33);
});
