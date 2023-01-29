import fs from "node:fs";
import path from "node:path";
import { IConfigSchema } from "../types/global";
// import { pathToFileURL } from "node:url";
import { DEFAULT_CONFIG_FILES } from "./constants";

const configRoot = process.cwd();

/**
 * 通过 CWD 去解析配置文件
 */
export const resolveConfig = async () => {
  let resolvedPath: string | undefined;
  for (const filename of DEFAULT_CONFIG_FILES) {
    const filePath = path.resolve(configRoot, filename);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    resolvedPath = filePath;
    break;
  }
  if (!resolvedPath) {
    throw new Error("no config file found.");
  }
  // if (typeof require === "undefined") {
  //   // CJS `require` 可以直接绝对路径，如果 ESM `import()` 需要转为 URL
  //   // windows 下 D:\ 开头文件文件路径用 `import()` 加载会有问题
  //   // 需要用 `pathToFileURL` 转为合法的 URL 格式
  //   resolvedPath = `${pathToFileURL(resolvedPath)}`;
  // }
  const config = require(resolvedPath);

  return config as IConfigSchema;
};
