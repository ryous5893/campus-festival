const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const seed = require("../assets/seed.js");

// Run the actual app and its event handlers with only the browser APIs it uses.
function openApp() {
  const elements = new Map();
  const listeners = new Map();
  let saved = JSON.stringify(seed);
  let formValues = {};
  const location = { hash: "#groups" };
  const element = (selector) => {
    if (!elements.has(selector)) {
      elements.set(selector, {
        innerHTML: "",
        textContent: "",
        style: {},
        open: false,
        addEventListener() {},
        focus() {},
        setSelectionRange() {},
        showModal() {
          this.open = true;
        },
        close() {
          this.open = false;
        },
      });
    }
    return elements.get(selector);
  };
  const context = vm.createContext({
    structuredClone,
    location,
    document: { querySelector: element, querySelectorAll: () => [] },
    localStorage: {
      getItem: () => saved,
      setItem(key, value) {
        saved = value;
      },
    },
    FormData: class {
      constructor() {
        return Object.entries(formValues);
      }
    },
    setTimeout() {},
    clearTimeout() {},
    addEventListener: (event, handler) => listeners.set(event, handler),
  });
  context.window = context;
  for (const file of ["seed.js", "domain.js", "app.js"]) {
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "../assets", file), "utf8"),
      context,
      { filename: file },
    );
  }
  return {
    element,
    savedGroups: () => JSON.parse(saved).groups.map((g) => g.name),
    search(value) {
      element("#search").oninput({ target: { value, selectionStart: 0 } });
    },
    add(name) {
      element("#add-row").onclick();
      formValues = { name, representative: "代表", members: "1", budget: "1000" };
      element("#edit-form").onsubmit({ preventDefault() {} });
    },
  };
}

test("a group added while searching appears in the list", () => {
  const app = openApp();
  app.search("ゲーム");
  assert.ok(!app.element("#content").innerHTML.includes("写真部"));

  app.add("新しい団体");

  assert.ok(app.savedGroups().includes("新しい団体"));
  assert.ok(app.element("#content").innerHTML.includes("新しい団体"));
  assert.ok(app.element("#content").innerHTML.includes("写真部"));
});

test("a rejected group shows the reason in the open dialog and clears on reopen", () => {
  const app = openApp();

  app.add("ゲーム制作部");

  assert.equal(app.element("#form-error").textContent, "同じ名前の団体が存在します");
  assert.equal(app.element("#editor").open, true);
  assert.equal(app.savedGroups().filter((n) => n === "ゲーム制作部").length, 1);

  app.element("#close-dialog").onclick();
  app.element("#add-row").onclick();
  assert.equal(app.element("#form-error").textContent, "");
});
