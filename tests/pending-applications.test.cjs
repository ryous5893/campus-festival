const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("pending count includes submitted applications only", () => {
  const applications = ["draft", "submitted", "approved", "rejected", "cancelled", "submitted"].map(status => ({ status }));
  assert.equal(D.pending({ applications }), 2);
  assert.equal(D.pending({ applications: [{ status: "draft" }] }), 0);
  assert.equal(D.pending({ applications: [] }), 0);
});
