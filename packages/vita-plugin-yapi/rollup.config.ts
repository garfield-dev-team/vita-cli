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
      // 由于 node-fetch 混合了默认导出和具名导出
      // 对 node-fetch 的默认导出进行 hack 处理
      interop: "auto",
      preserveModules: true,
      preserveModulesRoot: "src",
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
