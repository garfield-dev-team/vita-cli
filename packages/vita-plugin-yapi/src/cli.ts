#!/usr/bin/env node
import { cac } from "cac";
import consola from "consola";
import { validateCache } from "./cache";
import { generateDts } from "./dtsGenerator";
import { request } from "./request";
import { resolveConfig, saveWithStream } from "./utils";
import { combineApiChunks, generateApi } from "./apiGenerator";

const cli = cac("nei2dts");

cli
  .command("gen", "generate .d.ts definition and api request function")
  .option("--dts", `[boolean] generate .d.ts definition only`)
  .option("--dry", `[boolean] no emit files`)
  .action(async ({ dts, dry }: { dts?: boolean; dry?: boolean }) => {
    const userConfig = await resolveConfig();
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

      consola.success(
        `Type definition file has been generated for group ${key}`,
      );
    }
  });

cli.help();

cli.parse();
