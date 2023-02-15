import { WebpackEnvEnum } from "../utils/constants";
import type { IBabelConfigCtx } from "./webpack.config";

export const getBabelConfig = ({ env, useTypeScript, enableNewJsxTransform }: IBabelConfigCtx) => {
  const isEnvDevelopment = env === WebpackEnvEnum.DEVELOPMENT;
  const isEnvProduction = env === WebpackEnvEnum.PRODUCTION;

  return {
    presets: [
      useTypeScript && "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          modules: false,
          useBuiltIns: "entry",
          corejs: 3
        }
      ],
      [
        "@babel/preset-react",
        {
          runtime: enableNewJsxTransform ? "automatic": "classic",
        }
      ]
    ].filter(Boolean),
    babelrc: false,
    configFile: false,
    // 除了 `@babel/plugin-proposal-decorators`、`@babel/plugin-proposal-private-methods` 仍在提案阶段
    // 其他语法已经全部纳入 `@babel/preset-env`，无需单独安装语法插件
    plugins: [
      // 开发环境启用 `react-refresh` 热更新 React 组件
      isEnvDevelopment && require.resolve("react-refresh/babel"),
      [
        "@babel/plugin-transform-runtime",
        {
          // 不需要该插件引入 polyfill
          // 默认就是 false
          corejs: false,
          // helper 函数从 @babel/runtime 引入
          // 默认就是 true
          helpers: true,
          version: require('@babel/runtime/package.json').version,
          // regeneratorRuntime 是否通过模块导入（Babel 7.18.0 后支持）
          // 如果为 false 则从全局作用域获取
          // 默认为 true
          regenerator: true,
        }
      ],
      isEnvProduction && [
        // 生产环境下移除老代码中的 PropTypes
        require('babel-plugin-transform-react-remove-prop-types').default,
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
    // 启用 babel-loader 缓存能力
    // Webpack5 自带的持久化缓存粒度太大，修改配置文件就会导致缓存失效
    cacheDirectory: true,
    cacheCompression: false,
    compact: isEnvProduction,
  };
}
