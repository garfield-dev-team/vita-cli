const fs = require("node:fs");
const path = require("node:path");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");

const workDir = process.cwd();
const appRoot = path.resolve(workDir, "src");
const packageList = fs.readdirSync(appRoot);

module.exports = packageList.map((pkg) => ({
  input: `src/${pkg}/index.ts`,
  output: {
    dir: `compiled/${pkg}`,
    format: "cjs",
  },
  plugins: [resolve(), commonjs()],
}));
