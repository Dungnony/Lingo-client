// A misspelt `styles.foo` compiles fine and silently renders class="undefined",
// so check every CSS-module class used in a component exists in its stylesheet.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_DIRS = ["app", "components"];
const IMPORT_RE =
  /import\s+(\w+)\s+from\s+["']([^"']+\.module\.css)["']/g;
const CLASS_RE = /\.(-?[A-Za-z_][\w-]*)/g;

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function resolveCss(fromFile, specifier) {
  return specifier.startsWith("@/")
    ? path.join(ROOT, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
}

function cssClasses(cssFile) {
  const css = fs.readFileSync(cssFile, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  return new Set([...css.matchAll(CLASS_RE)].map((m) => m[1]));
}

function missingClasses() {
  const missing = [];
  const files = SOURCE_DIRS.flatMap((d) => sourceFiles(path.join(ROOT, d)));
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const [, name, specifier] of source.matchAll(IMPORT_RE)) {
      const classes = cssClasses(resolveCss(file, specifier));
      const usage = new RegExp(`\\b${name}\\.([A-Za-z_]\\w*)`, "g");
      for (const [, used] of source.matchAll(usage)) {
        if (!classes.has(used)) {
          missing.push(`${path.relative(ROOT, file)}: ${name}.${used}`);
        }
      }
    }
  }
  return missing;
}

test("every CSS-module class used in a component is defined", () => {
  assert.deepEqual(missingClasses(), []);
});
