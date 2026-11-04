const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("only the executive committee can approve applications", () => {
  assert.equal(D.canApprove("admin"), true);
  assert.equal(D.canApprove("leader"), false);
  assert.equal(D.canApprove("staff"), false);
  assert.equal(D.canApprove(undefined), false);
});
