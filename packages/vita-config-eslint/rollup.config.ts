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
      // ESLint 继承配置的时候，需要用 CJS 的 `module.exports`
      // 如果通过 `exports.default` 导出会报错，因此这里需要关闭该配置
      // 建议模块如果只有一个导出的时候，推荐 default export
      // 当模块有多个导出，推荐全部用 named export
      // exports: "named",
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
