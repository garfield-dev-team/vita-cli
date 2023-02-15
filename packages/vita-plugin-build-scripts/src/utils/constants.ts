/**
 * webpack mode option
 */
export enum WebpackEnvEnum {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

/**
 * 判断是否为 CI 环境
 */
export const IS_CI_ENV =
  process.env.CI &&
  (typeof process.env.CI !== "string" ||
    process.env.CI.toLowerCase() !== "false");
