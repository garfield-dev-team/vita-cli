import { CAC } from "cac";

class BuildScriptsPlugin {
  apply(cli: CAC) {
    cli
      .command("serve", "start development server")
      .option("--host [host]", `[string] specify hostname`)
      .option("--port <port>", `[number] specify port`)
      .option("--https", `[boolean] use TLS + HTTP/2`)
      .option("--open [path]", `[boolean | string] open browser on startup`)
      .action(async () => {
        const module = await import("./scripts/serve");
        // TODO: 传入配置参数
        await module.serve();
      });

    cli
      .command("build", "create an optimized production build")
      .option("--analyze", `[boolean] build and run bundle analyzer`)
      .action(async ({ analyze }) => {
        const module = await import("./scripts/build");
        // TODO: 传入配置参数
        await module.build();
      });
  }
}

export type { IBuildOptions } from "./types/global";

export default BuildScriptsPlugin;
