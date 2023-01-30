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

async function runServer() {
  console.log(chalk.cyan("Starting the development server...\n"));

  const config = await configFactory({
    mode: WebpackEnvEnum.DEVELOPMENT,
  });

  const DEFAULT_PORT = config.devServer!.port;
  const HOST = config.devServer!.host;
  const protocol = config.devServer!.https ? "https" : "http";
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
    openBrowser(urls.localUrlForBrowser);
  });

  const devServer = new WebpackDevServer(config.devServer, compiler);

  await devServer.start();
}

export async function serve() {
  try {
    await runServer();
  } catch (err) {
    console.log(err);
  }
}
