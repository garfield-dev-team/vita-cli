/**
 * 支持以下几种配置文件格式
 */
export const DEFAULT_CONFIG_FILES = [
  ".vitarc",
  "vita.config.js",
  "vita.config.cjs",
] as const;

export const CONFIG_KEY_MAP = {
  build: "@study/vita-plugin-build-scripts",
};

type IConfigKeys = keyof typeof CONFIG_KEY_MAP;

export type IConfigSchema = Record<IConfigKeys, any>;
