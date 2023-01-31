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
        const { errcode, data } = await request({
          params: {
            id,
          },
          headers: userConfig.headers,
        });
        if (errcode !== 0) {
          consola.error(data);
          process.exit(1);
        }
        return data;
      }),
    );

    // 判断接口文档是否更新
    if (!dry && (await validateCache(collection))) {
      consola.success(`Cache is valid for group ${key}. No need to update.`);
      continue;
    }

    // 生成 `.d.ts` 类型声明
    const dtsChunks = collection.map((data) => generateDts(data, userConfig));
    const declarationFilePath = `${declarationPath}/${key}.d.ts`;
    !dry && (await saveWithStream(declarationFilePath, dtsChunks));

    if (!dts) {
      // 生成 API 请求函数
      const apiChunks = combineApiChunks(
        collection.map((data) => generateApi(data, userConfig)),
        userConfig,
        key,
      );
      const apiFilePath = `${apiPath}/${key}.ts`;
      !dry && (await saveWithStream(apiFilePath, apiChunks));
    }

    consola.success(`Type definition file has been generated for group ${key}`);
  }
};
