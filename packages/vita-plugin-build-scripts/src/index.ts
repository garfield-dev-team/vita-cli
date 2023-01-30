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
      .action(async ({ host, port, https, open }: IDevServerOpts) => {
        const module = await import("./scripts/serve");
        await module.serve({
          ...options,
          ...(host !== undefined && { host }),
          ...(port !== undefined && { port }),
          ...(https !== undefined && { https }),
          ...(open !== undefined && { open }),
        });
      });

    cli
      .command("build", "create an optimized production build")
      .option("--analyze", `[boolean] build and run bundle analyzer`)
      .action(async ({ analyze }: { analyze?: true }) => {
        const module = await import("./scripts/build");
        await module.build({
          ...options,
          ...(analyze !== undefined && { analyze }),
        });
      });
  }
}

export { IBuildOptions };

export default BuildScriptsPlugin;
