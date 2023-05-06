import type { CAC } from "cac";
import type { IBabelConfigCtx } from "./config/webpack.config";
import type { IDevServerOpts } from "./scripts/serve";
import type { PublicBuildOptions } from "./types/global";
import { WebpackEnvEnum } from "./utils/constants";
import { loadEnvironFromEnvFiles } from "./utils/helpers";

class BuildScriptsPlugin {
  apply(cli: CAC, options: PublicBuildOptions) {
    cli
      .command("serve", "start development server")
      .option("--host [host]", `[string] specify hostname`)
      .option("--port <port>", `[number] specify port`)
      .option("--https", `[boolean] use TLS + HTTP/2`)
      .option("--open", `[boolean] open browser on startup`)
      .option("--mode <mode>", `[string] set env mode`)
      .action(
        async ({
          host,
          port,
          https,
          open,
          mode = "development",
        }: IDevServerOpts) => {
          loadEnvironFromEnvFiles(mode);
          const module = await import("./scripts/serve");
          await module.serve({
            ...options,
            ...(host !== undefined && { host }),
            ...(port !== undefined && { port }),
            ...(https !== undefined && { https }),
            ...(open !== undefined && { open }),
            ...(mode !== undefined && { mode }),
          });
        },
      );

    cli
      .command("build", "create an optimized production build")
      .option("--analyze", `[boolean] build and run bundle analyzer`)
      .option("--lib", `[boolean] use lib mode for building ui library`)
      .option("--mode <mode>", `[string] set env mode`)
      .action(
        async ({
          analyze,
          lib,
          mode = "production",
        }: {
          analyze?: true;
          lib?: true;
          mode?: string;
        }) => {
          loadEnvironFromEnvFiles(mode);
          const module = await import("./scripts/build");
          await module.build({
            ...options,
            ...(analyze !== undefined && { analyze }),
            ...(lib !== undefined && { lib }),
            ...(mode !== undefined && { mode }),
          });
        },
      );

    cli
      .command("build-ssg", "prerender using static site generation")
      .option("--mode <mode>", `[string] set env mode`)
      .action(async ({ mode = "production" }: { mode?: string }) => {
        loadEnvironFromEnvFiles(mode);
        const module = await import("./scripts/build-ssg");
        await module.build({
          ...options,
          ...(mode !== undefined && { mode }),
        });
      });
  }
}

export { PublicBuildOptions, WebpackEnvEnum, IBabelConfigCtx };

export default BuildScriptsPlugin;
