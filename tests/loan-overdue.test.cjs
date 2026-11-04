const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("returned loans are not overdue while outstanding past-due loans are", () => {
  const today = "2026-11-04";
  assert.equal(D.loanOverdue({ status: "returned", due: "2026-11-01" }, today), false);
  assert.equal(D.loanOverdue({ status: "active", due: "2026-11-01" }, today), true);
  assert.equal(D.loanOverdue({ status: "reserved", due: "2026-11-01" }, today), true);
  assert.equal(D.loanOverdue({ status: "active", due: today }, today), false);
  assert.equal(D.loanOverdue({ status: "active", due: "2026-11-05" }, today), false);
});
