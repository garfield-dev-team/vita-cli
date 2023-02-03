import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import fsExtra from "fs-extra";
import type { EmittedAsset, InputOptions, Plugin } from "rollup";

const workDir = process.cwd();
const dtsFileKey = ["types", "typings"] as const;
const archivedFileName = ["LICENSE", "LICENSE.md", "README.md"] as const;

const getPkgInfo = async (path: string) => {
  return JSON.parse(await fs.readFile(path, "utf-8"));
};

type IPlguinOptions = {
  outDir: string;
};

/**
 * 用 Rollup 对某些第三方库进行 pre-bundle
 * 同时把第三方库的 package.json 也复制过去
 * 如果存在 dts 类型声明，也复制过去
 * @returns
 */
export function packageMeta({ outDir }: IPlguinOptions) {
  return {
    name: "package-meta",
    async buildStart(options: InputOptions) {
      await Promise.all(
        (options.input as string[]).map(async (input) => {
          // 读取 package.json，修改模块入口为打包后路径
          // 同时修改 `type="commonjs"`，确保 CJS 模块可以引用
          const pkgPath = path.resolve(workDir, `${input}/package.json`);
          const pkgInfo = await getPkgInfo(pkgPath);
          delete pkgInfo.module;
          delete pkgInfo.exports;
          pkgInfo.main = "index.js";
          pkgInfo.type = "commonjs";

          // 检查依赖是否存在类型声明文件，匹配到一个就直接退出
          for (const key of dtsFileKey) {
            if (key in pkgInfo) {
              const dtsPath = path.resolve(workDir, input, pkgInfo[key]);
              const stat = await fs.stat(dtsPath);

              if (stat.isDirectory()) {
                // 如果是目录形式，则复制目录
                // 同时更新 package.json 中类型声明文件字段
                const output = path.resolve(workDir, `${outDir}/typings`);
                await fsExtra.copy(dtsPath, output);
                pkgInfo[key] = "typings";
              } else {
                // 如果是文件形式，调用 Rollup API 输出 bundle
                // 同时更新 package.json 中类型声明文件字段
                const dtsContent = await fs.readFile(dtsPath);
                pkgInfo[key] = "index.d.ts";

                this.emitFile({
                  type: "asset",
                  needsCodeReference: false,
                  fileName: "index.d.ts",
                  source: dtsContent,
                } as EmittedAsset);
              }
              break;
            }
          }

          // 检查依赖是否存在文档类文件
          // 如果存在就复制到预打包路径下
          for (const file of archivedFileName) {
            const filePath = path.resolve(workDir, `${input}/${file}`);
            if (existsSync(filePath)) {
              fs.readFile(filePath).then((fileContent) => {
                this.emitFile({
                  type: "asset",
                  needsCodeReference: false,
                  fileName: file,
                  source: fileContent,
                } as EmittedAsset);
              });
            }
          }

          // 将 package.json 输出到预打包路径下
          this.emitFile({
            type: "asset",
            needsCodeReference: false,
            fileName: "package.json",
            source: JSON.stringify(pkgInfo, null, 4),
          } as EmittedAsset);
        }),
      );
    },
  } as Plugin;
}
