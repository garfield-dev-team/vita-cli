import type { IConfig } from "../types/global";
import consola from "consola";
import { validateCache } from "../scripts/cache";
import { generateDts } from "../scripts/dtsGenerator";
import { request } from "../utils/request";
import { saveWithStream } from "../utils/helper";
import { combineApiChunks, generateApi } from "../scripts/apiGenerator";

type IOpts = IConfig & { dts?: boolean; dry?: boolean };

export const generate = async ({ dry, dts, ...options }: IOpts) => {
  const userConfig = options;
  const {
    declarationPath = "src/types",
    apiPath = "src/api",
    apiGroup = {},
  } = userConfig;

  for (const [key, urls] of Object.entries(apiGroup)) {
    const collection = await Promise.all(
      urls.map(async (url) => {
        const id = url.replace(/^.*\/(\d+)$/, "$1");
        try {
          const res = await request({
            params: {
              id,
            },
            headers: userConfig.headers,
          });
          const { errcode, data } = res;
          if (errcode !== 0) {
            throw res;
          }
          return data;
        } catch (err) {
          consola.error(err);
          process.exit(1);
        }
      }),
    );

    // 判断接口文档是否更新
    if (!dry && (await validateCache(collection))) {
      consola.success(`Cache is valid for group ${key}. No need to update.`);
      continue;
    }

    // 生成 `.d.ts` 类型声明
    const dtsChunks = collection.map((data) => generateDts(data, userConfig));
    if (!dry) {
      await saveWithStream({
        dir: declarationPath,
        filename: `${key}.d.ts`,
        chunks: dtsChunks,
      });
    }

    if (!dts) {
      // 生成 API 请求函数
      const apiChunks = combineApiChunks(
        collection.map((data) => generateApi(data, userConfig)),
        userConfig,
        key,
      );
      if (!dry) {
        await saveWithStream({
          dir: apiPath,
          filename: `${key}.ts`,
          chunks: apiChunks,
        });
      }
    }

    consola.success(`Type definition file has been generated for group ${key}`);
  }
};
