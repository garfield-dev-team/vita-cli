// @ts-ignore
import fsExtra from "fs-extra";
import webpack from "webpack";
// @ts-ignore
import chalk from "react-dev-utils/chalk";
// @ts-ignore
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
// @ts-ignore
import printBuildError from "react-dev-utils/printBuildError";
import { configFactory } from "../config/webpack.config";
import { appBuild, appPublic, appHtml } from "../config/paths";
import { WebpackEnvEnum } from "../utils/constants";
import { IBuildOptions } from "../types/global";

async function runBuild(options: IBuildOptions) {
  console.log("Creating an optimized production build...");

  process.env.NODE_ENV = "production";

  const config = await configFactory({
    env: WebpackEnvEnum.PRODUCTION,
    ...options,
  });

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages: any;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
          errMessage +=
            "\nCompileError: Begins at CSS selector " +
            // @ts-ignore
            err["postcssNode"].selector;
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          (stats as webpack.Stats).toJson({
            all: false,
            warnings: true,
            errors: true,
          }),
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join("\n\n")));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== "string" ||
          process.env.CI.toLowerCase() !== "false") &&
        messages.warnings.length
      ) {
        // Ignore sourcemap warnings in CI builds. See #8227 for more info.
        const filteredWarnings = messages.warnings.filter(
          (w: string) => !/Failed to parse source map/.test(w),
        );
        if (filteredWarnings.length) {
          console.log(
            chalk.yellow(
              "\nTreating warnings as errors because process.env.CI = true.\n" +
                "Most CI servers set it automatically.\n",
            ),
          );
          return reject(new Error(filteredWarnings.join("\n\n")));
        }
      }

      const resolveArgs: any = {
        stats,
        warnings: messages.warnings,
      };

      return resolve(resolveArgs);
    });
  });
}

function copyPublicFolder() {
  fsExtra.copySync(appPublic, appBuild, {
    dereference: true,
    filter: (file: string) => file !== appHtml,
  });
}

export async function build(options: IBuildOptions & { mode?: string }) {
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
