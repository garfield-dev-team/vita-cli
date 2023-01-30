import Config from "webpack-5-chain";
import webpack from "webpack";

export type IBuildOptions = {
  // 是否启用 webpack-bundle-analyzer
  // 默认值 false
  analyze?: true;
  // 启用内置的分包策略，将 `@study` 前缀依赖视为业务组件库单独拆包，antd 每个组件单独拆包，优化缓存
  // 默认开启，可以配置 `false` fallback 到 Webpack 默认缓存组策略
  codeSplitting?: false;
  // 是否启用 automatic JSX
  // 默认启用，可以配置 `false` fallback 到 classic JSX
  enableNewJsxTransform?: false;
  // 配置代理功能，仅在 dev 时有效
  proxy?: {};
  // 静态资源前缀，非根路径部署，或者生产环境静态资源上传 CDN 会用到
  // 默认值 "/"
  publicPath?: string;
  // 提供给 less-loader 的主题变量
  theme?: {};
  // 用链式编程的方式修改 webpack 配置，基于 webpack-chain
  // 具体 API 可参考 webpack-api 的文档。
  chainWebpack?: (config: Config) => void;
  modifyWebpackConfig?: webpack.Configuration;
};
