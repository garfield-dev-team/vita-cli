import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
// @ts-ignore
import chalk from "react-dev-utils/chalk";
import {
  createCompiler,
  prepareUrls,
  // @ts-ignore
} from "react-dev-utils/WebpackDevServerUtils";
// @ts-ignore
import openBrowser from "react-dev-utils/openBrowser";
import { configFactory } from "../config/webpack.config";
import { appPackageJson } from "../config/paths";
import { WebpackEnvEnum } from "../utils/constants";
import { IBuildOptions } from "../types/global";

export type IDevServerOpts = {
  host?: string;
  port?: number;
  https?: true;
  open?: true;
  mode?: string;
};

type IServerOptions = IBuildOptions & IDevServerOpts;

async function runServer({
  host,
  port,
  https,
  open,
  ...option
}: IServerOptions) {
  console.log(chalk.cyan("Starting the development server...\n"));

  process.env.NODE_ENV = "development";

  const config = await configFactory({
    env: WebpackEnvEnum.DEVELOPMENT,
    ...option,
  });

  const DEFAULT_PORT = port !== undefined ? port : config.devServer!.port;
  const HOST = host || config.devServer!.host;
  const protocol = https || config.devServer!.https ? "https" : "http";
  const appName = require(appPackageJson).name;

  let isFirstCompile = true;

  const urls = prepareUrls(protocol, HOST, DEFAULT_PORT, "/");

  const compiler = createCompiler({
    appName,
    config,
    urls,
    useYarn: true,
    useTypeScript: true,
    webpack,
  });

  compiler.hooks.done.tap("done", () => {
    if (!isFirstCompile) return;
    isFirstCompile = false;
    if (open) {
      openBrowser(urls.localUrlForBrowser);
    }
  });

  const devServer = new WebpackDevServer(
    Object.assign({}, config.devServer, {
      ...(host && { host }),
      ...(port !== undefined && { port }),
      ...(https !== undefined && { https }),
    }),
    compiler,
  );

  await devServer.start();
}

export async function serve(options: IServerOptions) {
  try {
    await runServer(options);
  } catch (err) {
    console.log(err);
  }
}
