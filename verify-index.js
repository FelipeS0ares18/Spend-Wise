const fs = require("fs");
const path = require("path");
const parser = require("./node_modules/@babel/parser");

const root = __dirname;
const build = path.join(root, "build");
const src = path.join(root, "src");
const indexPath = path.join(build, "index.html");

if (!fs.existsSync(indexPath)) throw new Error("build/index.html nao encontrado.");
const index = fs.readFileSync(indexPath, "utf8");

if (!/\/assets\/index-[^"]+\.js/.test(index)) throw new Error("Bundle JS Vite nao referenciado no index.html.");
if (!/\/assets\/index-[^"]+\.css/.test(index)) throw new Error("Bundle CSS Vite nao referenciado no index.html.");

const requiredBuildFiles = [
  "assets/js/pwa.js",
  "assets/manifest/manifest.json",
  "assets/img/favicon-v2.ico",
  "assets/img/logo192.png",
  "assets/img/logo512.png"
];
for (const file of requiredBuildFiles) {
  if (!fs.existsSync(path.join(build, file))) throw new Error(file + " nao encontrado em build/.");
}

const requiredSourceFiles = [
  ["main.jsx"],
  ["App.jsx"],
  ["components/appPrimitives.jsx"],
  ["domain/financeMetrics.ts", "domain/financeMetrics.js"],
  ["services/firebase.ts", "services/firebase.js"],
  ["styles/app.css"]
];
for (const options of requiredSourceFiles) {
  if (!options.some(file => fs.existsSync(path.join(src, file)))) throw new Error(options.join(" ou ") + " nao encontrado em src/.");
}

const manifest = JSON.parse(fs.readFileSync(path.join(build, "assets/manifest/manifest.json"), "utf8"));
for (const icon of manifest.icons || []) {
  const resolved = path.resolve(path.dirname(path.join(build, "assets/manifest/manifest.json")), icon.src);
  if (!fs.existsSync(resolved)) throw new Error("Icone do manifest nao encontrado: " + icon.src);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

for (const file of walk(src).filter(file => /\.(jsx?|mjs|tsx?)$/.test(file))) {
  parser.parse(fs.readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: ["jsx", "typescript"]
  });
}

parser.parse(fs.readFileSync(path.join(build, "assets/js/pwa.js"), "utf8"), {
  sourceType: "script"
});

console.log("JSX parse OK");
console.log("Arquitetura Vite OK: src/, build/, assets PWA e manifest validados");
