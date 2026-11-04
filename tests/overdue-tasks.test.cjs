const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("overdue count excludes completed tasks while keeping unfinished overdue tasks", () => {
  const tasks = [
    { id: "done", status: "done", due: "2026-11-01" },
    { id: "todo", status: "todo", due: "2026-11-01" },
    { id: "active", status: "active", due: "2026-11-02" },
    { id: "today", status: "todo", due: "2026-11-04" },
    { id: "future", status: "todo", due: "2026-11-05" },
  ];
  assert.deepEqual(D.overdueTasks({ tasks }, "2026-11-04").map((t) => t.id), ["todo", "active"]);
});
