import path from "node:path";
import fs from "node:fs";
import { Readable } from "node:stream";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import consola from "consola";
import { CACHE_DIR, REQUEST_VERB_MAPPING } from "./constants";
import { IConfig, IYApiResponseDataType } from "../types/global";
import os from "node:os";

const configRoot = process.cwd();

/**
 * 是否存在缓存目录
 * @returns
 */
const hasCacheDir = () => {
  return fs.existsSync(path.resolve(configRoot, CACHE_DIR));
};

/**
 * 提取缓存内容
 */
export const restoreCache = async () => {
  if (!hasCacheDir()) {
    await createCacheDir();
    return {};
  }
  const cacheDir = path.resolve(
    path.resolve(configRoot, `${CACHE_DIR}/index.json`),
  );
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
  const cacheDir = path.resolve(
    path.resolve(configRoot, `${CACHE_DIR}/index.json`),
  );
  return writeFile(cacheDir, JSON.stringify(content, null, 4), "utf-8");
};

/**
 * 创建缓存
 */
const createCacheDir = () => {
  return mkdir(path.resolve(configRoot, CACHE_DIR));
};

/**
 * 保存文件
 * 用流的方式写入，避免一次性加载太多内容
 * @param filePath
 * @param chunks
 * @returns
 */
export const saveWithStream = (
  filePath: string,
  chunks: string[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(configRoot, filePath);

    const writable = fs.createWriteStream(absPath, "utf-8");
    writable.on("finish", resolve);
    writable.on("error", reject);

    const readable = chunks.reduce((accu, cur) => {
      accu.push(cur);
      return accu;
    }, new Readable());
    readable.push(null);

    readable.pipe(writable);
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
