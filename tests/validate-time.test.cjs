const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../assets/domain.js");

test("the end time must be later than the start time", () => {
  const error = "終了時刻を開始時刻より後にしてください";
  assert.equal(D.validateTime({ start: "10:00", end: "10:00" }), error);
  assert.equal(D.validateTime({ start: "11:00", end: "10:00" }), error);
  assert.equal(D.validateTime({ start: "10:00", end: "10:01" }), "");
  assert.equal(D.validateTime({ start: "09:00", end: "12:00" }), "");
});
