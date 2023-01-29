import path from "node:path";

const appPath = process.cwd();
const appBuild = path.resolve(appPath, "dist");
const appPublic = path.resolve(appPath, "public");
const appHtml = path.resolve(appPath, "public/index.html");
const appIndexJs = path.resolve(appPath, "src/index");
const appPackageJson = path.resolve(appPath, "package.json");
const appSrc = path.resolve(appPath, "src");
const appTsConfig = path.resolve(appPath, "tsconfig.json");
const appNodeModules = path.resolve(appPath, "node_modules");
const appWebpackCache = path.resolve(appPath, "node_modules/.cache");
const appTsBuildInfoFile = path.resolve(
  appPath,
  "node_modules/.cache/tsconfig.tsbuildinfo",
);

export {
  appPath,
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
