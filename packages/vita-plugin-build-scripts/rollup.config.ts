import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import externals from "rollup-plugin-node-externals";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      dir: "dist",
      format: "cjs",
      preserveModules: true,
      preserveModulesRoot: "src",
      exports: "named",
    },
  ],
  plugins: [
    resolve(),
    externals({
      devDeps: false,
    }),
    typescript({
      compilerOptions: {
        rootDir: "./src",
      },
    }),
  ],
});
