import { createRequire } from "node:module";
import { defineConfig, type RollupOptions } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { packageMeta } from "./plugins";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const config = defineConfig(
  Object.keys(pkg.devDependencies).map<RollupOptions>((pkg) => ({
    input: `node_modules/${pkg}`,
    output: {
      dir: `compiled/${pkg}`,
      entryFileNames: "index.js",
      format: "cjs",
    },
    plugins: [resolve(), commonjs(), packageMeta()],
  })),
);

export default config;
