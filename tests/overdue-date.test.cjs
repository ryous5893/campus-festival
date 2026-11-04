const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("overdue compares the full date across month and year boundaries", () => {
  for (const [due, today, expected] of [
    ["2026-10-31", "2026-11-01", true],
    ["2025-12-31", "2026-01-01", true],
    ["2026-11-01", "2026-11-01", false],
    ["2026-12-01", "2026-11-30", false],
    ["2027-01-01", "2026-12-31", false],
  ]) assert.equal(D.overdue({ due }, today), expected, `${due} / ${today}`);
  const tasks = [{ id: "old", due: "2026-10-31", status: "todo" }, { id: "done", due: "2026-10-31", status: "done" }];
  assert.deepEqual(D.overdueTasks({ tasks }, "2026-11-01").map(t => t.id), ["old"]);
});
