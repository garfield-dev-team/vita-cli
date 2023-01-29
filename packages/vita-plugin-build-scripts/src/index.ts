import { CAC } from "cac";

class BuildScriptsPlugin {
  apply(cli: CAC) {
    cli
      .command("serve", "start development server")
      .option("--host [host]", `[string] specify hostname`)
      .option("--port <port>", `[number] specify port`)
      .option("--https", `[boolean] use TLS + HTTP/2`)
      .option("--open [path]", `[boolean | string] open browser on startup`)
      .action(() => {
        require("./scripts/serve");
      });

    cli
      .command("build", "create an optimized production build")
      .option("--analyze", `[boolean] build and run bundle analyzer`)
      .action(async ({ analyze }) => {
        require("./scripts/build");
      });
  }
}

export default BuildScriptsPlugin;
