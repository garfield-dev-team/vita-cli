import { createRequire } from "node:module";
import { defineConfig, RollupOptions } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import path from "node:path";
// import typescript from "@rollup/plugin-typescript";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const config = Object.keys(pkg.devDependencies).reduce<RollupOptions[]>(
  (accu, pkg) => {
    const pkgInfo = require(`${pkg}/package.json`);
    return accu.concat([
      {
        input: `node_modules/${pkg}`,
        output: {
          dir: `compiled/${pkg}`,
          entryFileNames: "index.js",
          format: "cjs",
        },
        plugins: [resolve(), commonjs()],
      },
      {
        input: path.resolve(`node_modules/${pkg}`, pkgInfo.types),
        output: [
          {
            file: `compiled/${pkg}/index.d.ts`,
            format: "es",
          },
        ],
        plugins: [resolve(), dts()],
      },
    ]);
  },
  [],
);

export default config;
