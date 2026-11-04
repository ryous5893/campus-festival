const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const seed = require("../assets/seed.js");
const KEY = "campus-festival-v1";

// Run the actual app and its event handlers with only the browser APIs it uses.
function openApp(saved = JSON.stringify(seed), confirmation = true) {
  const elements = new Map();
  const listeners = new Map();
  const downloads = [];
  const blobs = new Map();
  const confirmations = [];
  const location = { hash: "#settings" };
  const element = (selector) => {
    if (!elements.has(selector)) {
      elements.set(selector, {
        innerHTML: "",
        textContent: "",
        style: {},
        files: [],
        addEventListener() {},
      });
    }
    return elements.get(selector);
  };
  const context = vm.createContext({
    structuredClone,
    Blob,
    location,
    document: {
      querySelector: element,
      querySelectorAll: () => [],
      createElement: () => ({
        click() {
          downloads.push(blobs.get(this.href));
        },
      }),
    },
    localStorage: {
      getItem: () => saved,
      setItem(key, value) {
        assert.equal(key, KEY);
        saved = value;
      },
    },
    confirm(message) {
      confirmations.push(message);
      return confirmation;
    },
    URL: {
      createObjectURL(blob) {
        const url = "blob:" + blobs.size;
        blobs.set(url, blob);
        return url;
      },
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
    downloads,
    confirmations,
    saved: () => saved,
    navigate(page) {
      location.hash = "#" + page;
      listeners.get("hashchange")();
    },
    async selectFile(text) {
      const input = element("#restore-file");
      input.files = [{ text: async () => text }];
      assert.equal(typeof input.onchange, "function", "file selection must start restore");
      await input.onchange({ target: input });
    },
  };
}

function backup() {
  const data = structuredClone(seed);
  data.groups[0].name = "復元テスト団体";
  return data;
}

test("selecting an exported backup restores groups, persists data, and survives reload", async () => {
  const data = backup();
  const exporter = openApp(JSON.stringify(data));
  exporter.element("#backup").onclick();
  const text = Buffer.from(await exporter.downloads[0].arrayBuffer()).toString("utf8");
  assert.ok(text.startsWith("\uFEFF"), "use the app's BOM-prefixed export");

  const app = openApp();
  await app.selectFile(text);
  assert.deepEqual(app.confirmations, ["現在のデータを置き換えますか？"]);
  const restored = JSON.parse(app.saved());
  assert.deepEqual(restored.groups, data.groups);
  for (const key of Object.keys(data).filter((key) => key !== "activity")) {
    assert.deepEqual(restored[key], data[key]);
  }
  assert.equal(restored.activity[0].message, "バックアップを復元しました");
  assert.match(app.element("#content").innerHTML, /復元テスト団体/);
  app.navigate("groups");
  assert.match(app.element("#content").innerHTML, /復元テスト団体/);

  const reloaded = openApp(app.saved());
  reloaded.navigate("groups");
  assert.match(reloaded.element("#content").innerHTML, /復元テスト団体/);
});

test("cancelling confirmation preserves current groups and storage", async () => {
  const app = openApp(undefined, false);
  const before = app.saved();
  await app.selectFile(JSON.stringify(backup()));
  assert.equal(app.confirmations.length, 1);
  assert.equal(app.saved(), before);
  assert.doesNotMatch(app.element("#content").innerHTML, /復元テスト団体/);
});

test("invalid JSON reports an error without replacing current data", async () => {
  const app = openApp();
  const before = app.saved();
  await app.selectFile("invalid JSON");
  assert.equal(app.saved(), before);
  assert.equal(app.confirmations.length, 0);
  assert.match(app.element("#toast").textContent, /^読み込めませんでした：/);
});

test("the read button still restores a selected file", async () => {
  const app = openApp();
  app.element("#restore-file").files = [{ text: async () => JSON.stringify(backup()) }];
  await app.element("#restore").onclick();
  assert.equal(JSON.parse(app.saved()).groups[0].name, "復元テスト団体");
});

test("no file selection preserves data and prompts for a file", async () => {
  const app = openApp();
  const before = app.saved();
  await app.element("#restore").onclick();
  assert.equal(app.saved(), before);
  assert.equal(app.confirmations.length, 0);
  assert.equal(app.element("#toast").textContent, "ファイルを選んでください");
});
