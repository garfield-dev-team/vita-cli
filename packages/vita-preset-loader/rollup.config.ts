import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import externals from "rollup-plugin-node-externals";
import typescript from "@rollup/plugin-typescript";

const getEntryPoint = () => {
  return fs
    .readdirSync(path.resolve(process.cwd(), "src"))
    .filter((n) => !n.includes("swc"))
    .map((n) => `src/${n}`);
};

export default defineConfig({
  input: getEntryPoint(),
  output: [
    {
      dir: "dist",
      format: "cjs",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
  ],
  plugins: [
    resolve(),
    externals({
      devDeps: true,
    }),
    typescript({
      compilerOptions: {
        rootDir: "./src",
      },
    }),
  ],
});
