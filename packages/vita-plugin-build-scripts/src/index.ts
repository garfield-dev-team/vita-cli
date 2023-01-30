import type { CAC } from "cac";
import { IDevServerOpts } from "./scripts/serve";
import type { IBuildOptions } from "./types/global";

class BuildScriptsPlugin {
  apply(cli: CAC, options: IBuildOptions) {
    cli
      .command("serve", "start development server")
      .option("--host [host]", `[string] specify hostname`)
      .option("--port <port>", `[number] specify port`)
      .option("--https", `[boolean] use TLS + HTTP/2`)
      .option("--open", `[boolean] open browser on startup`)
      .option("--mode <mode>", `[string] set env mode`)
      .action(async ({ host, port, https, open, mode }: IDevServerOpts) => {
        const module = await import("./scripts/serve");
        await module.serve({
          ...options,
          ...(host !== undefined && { host }),
          ...(port !== undefined && { port }),
          ...(https !== undefined && { https }),
          ...(open !== undefined && { open }),
          ...(mode !== undefined && { mode }),
        });
      });

    cli
      .command("build", "create an optimized production build")
      .option("--analyze", `[boolean] build and run bundle analyzer`)
      .option("--mode <mode>", `[string] set env mode`)
      .action(async ({ analyze, mode }: { analyze?: true; mode?: string }) => {
        const module = await import("./scripts/build");
        await module.build({
          ...options,
          ...(analyze !== undefined && { analyze }),
          ...(mode !== undefined && { mode }),
        });
      });
  }
}

export { IBuildOptions };

export default BuildScriptsPlugin;
