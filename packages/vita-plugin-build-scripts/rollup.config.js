const resolve = require("@rollup/plugin-node-resolve");
const externals = require("rollup-plugin-node-externals");
const typescript = require("@rollup/plugin-typescript");

module.exports = {
  input: "src/index.ts",
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
      devDeps: false,
    }),
    typescript(),
  ],
};
