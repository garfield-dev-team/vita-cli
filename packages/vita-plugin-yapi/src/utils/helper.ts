import path from "node:path";
import fs from "node:fs";
import { Readable } from "node:stream";
import { mkdir, readFile, writeFile } from "node:fs/promises";
// @ts-ignore
import fsExtra from "fs-extra";
import consola from "consola";
import { CACHE_DIR, REQUEST_VERB_MAPPING } from "./constants";
import { IConfig, IYApiResponseDataType } from "../types/global";
import os from "node:os";

const configRoot = process.cwd();
const cacheDir = path.resolve(configRoot, CACHE_DIR);
const cacheFile = path.resolve(configRoot, `${CACHE_DIR}/yapi.json`);

/**
 * 是否存在缓存目录
 * @returns
 */
const hasCacheDir = () => {
  return fs.existsSync(cacheDir);
};

/**
 * 提取缓存内容
 */
export const restoreCache = async () => {
  if (!hasCacheDir()) {
    await createCacheDir();
    return {};
  }
  const cacheDir = path.resolve(cacheFile);
  try {
    const cache = await readFile(cacheDir, "utf-8");
    return JSON.parse(cache) as Record<string, number>;
  } catch (e) {
    consola.error(e);
    process.exit(1);
  }
};

/**
 * 更新缓存
 */
export const updateCache = (content: Record<string, number>) => {
  const cacheDir = path.resolve(cacheFile);
  return writeFile(cacheDir, JSON.stringify(content, null, 4), "utf-8");
};

/**
 * 创建缓存
 */
const createCacheDir = () => {
  return mkdir(cacheDir);
};

/**
 * 保存文件
 * 用流的方式写入，避免一次性加载太多内容
 * @param filePath
 * @param chunks
 * @returns
 */
export const saveWithStream = async ({
  dir,
  filename,
  chunks,
}: {
  dir: string;
  filename: string;
  chunks: string[];
}): Promise<void> => {
  const absPath = path.resolve(configRoot, dir);
  await fsExtra.ensureDir(absPath);

  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(
      path.resolve(absPath, filename),
      "utf-8",
    );
    writable.on("finish", resolve);
    writable.on("error", reject);

    const readable = chunks.reduce((accu, cur) => {
      accu.push(cur);
      return accu;
    }, new Readable());
    // writable 读到 null 表示已经读取完毕
    readable.push(null);

    readable
      .on("error", () => {
        // `pipe` 方法注意事项，如果 `readable` 报错，需要监听 error 事件手动关闭 writable
        // 否则会造成文件句柄泄漏
        writable.close();
        reject();
      })
      .pipe(writable);
  });
};

/**
 * 生成缩进
 * @param tabSize
 */
export const getIndent = (tabSize: number = 2) => {
  return " ".repeat(tabSize);
};

/**
 * 接口文档页面地址
 * @param projectId
 * @param id
 */
export const getYapiPageUrl = (projectId: number, id: number) => {
  return `http://yapi.study.youdao.com/project/${projectId}/interface/api/${id}`;
};

/**
 * 生成 jsdoc 注释
 * @param url
 * @param title
 */
export const genTSDoc = (url: string, title: string) => {
  const list = [title, url];
  return ["/**", ...list.map((item) => ` * ${item}`), " */"].join(os.EOL);
};

/**
 * 单词首字母大写
 * @param s
 * @returns
 */
export const capitalize = (s: string) => {
  return s
    .split("")
    .map((char, index) => {
      if (index === 0) return char.toUpperCase();
      else return char.toLowerCase();
    })
    .join("");
};

/**
 * 转为大驼峰命名
 * @param path
 * @param ignorePrefix
 */
const toPascalCase = (path: string, ignorePrefix: string[]) => {
  return ignorePrefix
    .reduce((accu, cur) => accu.replace(cur, ""), path)
    .split("/")
    .filter((item) => item !== "")
    .map(capitalize)
    .join("");
};

/**
 * 生成接口类型命名
 * @param path
 * @param config
 */
export const genInterfaceName = (path: string, config: IConfig) => {
  const ignorePrefix = config.ignorePrefix || [];
  const interfaceName = toPascalCase(path, ignorePrefix);
  return `I${interfaceName}DataType`;
};

/**
 * 生成接口请求方法命名
 * @param data
 * @param config
 */
export const genMethodName = (data: IYApiResponseDataType, config: IConfig) => {
  const { path, method } = data;
  const ignorePrefix = config.ignorePrefix || [];
  const methodName = toPascalCase(path, ignorePrefix);
  const requestVerb = REQUEST_VERB_MAPPING[method];
  return ["$", requestVerb, methodName].join("");
};
