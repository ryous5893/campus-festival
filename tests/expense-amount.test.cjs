const assert = require("node:assert/strict");
const test = require("node:test");
const D = require("../assets/domain.js");

test("expense amounts must be whole yen instead of being silently truncated", () => {
  assert.notEqual(D.validateExpense({ amount: 100.75 }), "");
  assert.equal(D.validateExpense({ amount: 100 }), "");
  assert.notEqual(D.validateExpense({ amount: Infinity }), "");
});
