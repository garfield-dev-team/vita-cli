import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const workDir = process.cwd();
const appRoot = path.resolve(workDir, "src");
const packageList = fs.readdirSync(appRoot);

export default packageList.map((pkg) =>
  defineConfig({
    input: `src/${pkg}/index.ts`,
    output: {
      dir: `compiled/${pkg}`,
      format: "cjs",
    },
    plugins: [resolve(), commonjs()],
  }),
);
