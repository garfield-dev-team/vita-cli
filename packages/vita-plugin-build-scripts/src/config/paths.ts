import fs from "node:fs";
import path from "node:path";

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const dotenv = resolveApp(".env");
const appPath = resolveApp(".");
const appBuild = resolveApp(process.env.BUILD_PATH || "dist");
const appPublic = resolveApp("public");
const appHtml = resolveApp("public/index.html");
const appIndexJs = resolveApp("src/index");
const appPackageJson = resolveApp("package.json");
const appSrc = resolveApp("src");
const appTsConfig = resolveApp("tsconfig.json");
const appNodeModules = resolveApp("node_modules");
const appWebpackCache = resolveApp("node_modules/.cache");
const appTsBuildInfoFile = resolveApp(
  "node_modules/.cache/tsconfig.tsbuildinfo",
);

export {
  appPath,
  dotenv,
  appBuild,
  appPublic,
  appHtml,
  appIndexJs,
  appPackageJson,
  appSrc,
  appTsConfig,
  appNodeModules,
  appWebpackCache,
  appTsBuildInfoFile,
};
