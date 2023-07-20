import Config from "webpack-5-chain";
import webpack from "webpack";
import type { WebpackEnvEnum } from "../utils/constants";

export type IBuildOptions = {
  // 是否启用 webpack-bundle-analyzer
  // 默认值 false
  analyze?: boolean;
  // 启用内置的分包策略，将 `@study` 前缀依赖视为业务组件库单独拆包，antd 每个组件单独拆包，优化缓存
  // 默认开启，可以配置 `false` fallback 到 Webpack 默认缓存组策略
  codeSplitting?: boolean;
  // 是否启用 CSS splitting
  // 默认开启，某些场景下启用会导致样式冗余问题，建议关闭
  cssSplitting?: boolean;
  // 是否启用 automatic JSX
  // 默认启用，可以配置 `false` fallback 到 classic JSX
  enableNewJsxTransform?: boolean;
  // 生产环境打包是否通过 style-loader 强制内联样式
  // 默认值 false，仅在某些特殊场景下启用
  forceInlineStyle?: boolean;
  // 是否启用 SVG symbol 方式打包
  // 默认值 false，启用后可以优化 JS bundle 体积
  enableSVGSymbol?: boolean;
  // 配置代理功能，仅在 dev 时有效
  proxy?: {};
  // 提供给 less-loader 的主题变量
  theme?: {};
  // 用链式编程的方式修改 webpack 配置，基于 webpack-chain
  // 具体 API 可参考 webpack-api 的文档。
  chainWebpack?: (config: Config, env: WebpackEnvEnum) => void;
  modifyWebpackConfig?: webpack.Configuration;
};
