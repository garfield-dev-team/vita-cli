import fs from "node:fs/promises";
import path from "node:path";
import type { EmittedAsset, InputOptions, Plugin } from "rollup";

/**
 * 用 Rollup 对某些第三方库进行 pre-bundle
 * 同时把第三方库的 package.json 也复制过去
 * 如果存在 dts 类型声明，也复制过去
 * @returns
 */
export function packageMeta() {
  const workDir = process.cwd();
  const dtsFileKey = ["types", "typings"] as const;

  const getPkgInfo = async (path: string) => {
    return JSON.parse(await fs.readFile(path, "utf-8"));
  };

  return {
    name: "package-meta",
    async buildStart(options: InputOptions) {
      await Promise.all(
        (options.input as string[]).map(async (input) => {
          const pkgPath = path.resolve(workDir, `${input}/package.json`);
          const pkgInfo = await getPkgInfo(pkgPath);
          delete pkgInfo.module;
          delete pkgInfo.exports;
          pkgInfo.main = "index.js";
          pkgInfo.type = "commonjs";

          for (const key of dtsFileKey) {
            if (key in pkgInfo) {
              const dtsPath = path.resolve(workDir, input, pkgInfo[key]);
              const dtsContent = await fs.readFile(dtsPath);
              pkgInfo[key] = "index.d.ts";

              this.emitFile({
                type: "asset",
                name: "index.d.ts",
                needsCodeReference: false,
                fileName: "index.d.ts",
                source: dtsContent,
              } as EmittedAsset);
              break;
            }
          }

          this.emitFile({
            type: "asset",
            name: "package.json",
            needsCodeReference: false,
            fileName: "package.json",
            source: JSON.stringify(pkgInfo, null, 4),
          } as EmittedAsset);
        }),
      );
    },
  } as Plugin;
}
