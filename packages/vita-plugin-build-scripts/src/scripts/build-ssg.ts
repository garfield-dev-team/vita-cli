// @ts-ignore
import fsExtra from "fs-extra";
import webpack, { type Configuration } from "webpack";
// @ts-ignore
import chalk from "react-dev-utils/chalk";
// @ts-ignore
import printBuildError from "react-dev-utils/printBuildError";
import { configFactory } from "../config/webpack.config";
import { appBuild, appPublic, appHtml, appIndexJs } from "../config/paths";
import { WebpackEnvEnum } from "../utils/constants";
import { PublicBuildOptions } from "../types/global";

const logger = {
  error: (...args: any[]) => {
    console.log(chalk.red(...args));
  },
  warn: (...args: any[]) => {
    console.log(chalk.yellow(...args));
  },
};

/** Node major version, directly read from env. */
export const NODE_MAJOR_VERSION = parseInt(
  process.versions.node.split(".")[0]!,
  10,
);
/** Node minor version, directly read from env. */
export const NODE_MINOR_VERSION = parseInt(
  process.versions.node.split(".")[1]!,
  10,
);

function compile(config: Configuration[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err) {
        logger.error(err.stack ?? err);
        // @ts-ignore
        if (err.details) {
          // @ts-ignore
          logger.error(err.details);
        }
        reject(err);
      }
      // Let plugins consume all the stats
      const errorsWarnings = stats?.toJson("errors-warnings");
      if (stats?.hasErrors()) {
        reject(new Error("Failed to compile with errors."));
      }
      if (errorsWarnings && stats?.hasWarnings()) {
        errorsWarnings.warnings?.forEach((warning) => {
          logger.warn(warning);
        });
      }
      // Webpack 5 requires calling close() so that persistent caching works
      // See https://github.com/webpack/webpack.js.org/pull/4775
      compiler.close((errClose) => {
        if (errClose) {
          logger.error(`Error while closing Webpack compiler: ${errClose}`);
          reject(errClose);
        } else {
          resolve();
        }
      });
    });
  });
}

async function runBuild(options: PublicBuildOptions) {
  console.log("Creating an optimized production build...");

  process.env.NODE_ENV = "production";

  const clientConfig = await configFactory({
    env: WebpackEnvEnum.PRODUCTION,
    ...options,
  });

  // TODO: implement this
  const serverConfig = await configFactory({
    env: WebpackEnvEnum.PRODUCTION,
    ...options,
    analyze: false,
    codeSplitting: false,
    cssSplitting: false,
    enableNewJsxTransform: false,
    chainWebpack(config) {
      config.target(`node${NODE_MAJOR_VERSION}.${NODE_MINOR_VERSION}`);
      config
        .entry("main")
        .delete(appIndexJs)
        .add(require.resolve("../client/serverEntry.tsx"));
      config.output
        .filename("server.bundle.js")
        .libraryTarget("commonjs2")
        .globalObject("this");
    },
  });

  // Run webpack to build JS bundle (client) and static html files (server).
  await compile([clientConfig, serverConfig]);

  // TODO: fork child_process run server bundle to generate static HTML
}

function copyPublicFolder() {
  fsExtra.copySync(appPublic, appBuild, {
    dereference: true,
    filter: (file: string) => file !== appHtml,
  });
}

export async function build(options: PublicBuildOptions & { mode?: string }) {
  fsExtra.emptyDirSync(appBuild);
  copyPublicFolder();
  try {
    await runBuild(options);
  } catch (err) {
    console.log(chalk.red("Failed to compile.\n"));
    printBuildError(err);
    process.exit(1);
  }
}
