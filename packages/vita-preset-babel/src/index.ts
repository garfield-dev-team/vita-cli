import { WebpackEnvEnum } from "./constants";
import type { IBabelConfigCtx } from "@study/vita-plugin-build-scripts";

const getBabelPreset = ({
  env,
  useTypeScript,
  enableNewJsxTransform,
}: IBabelConfigCtx) => {
  const isEnvProduction = env === WebpackEnvEnum.PRODUCTION;

  return {
    presets: [
      useTypeScript && "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          modules: false,
          useBuiltIns: "entry",
          corejs: require("core-js/package.json").version,
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: enableNewJsxTransform ? "automatic" : "classic",
        },
      ],
    ].filter(Boolean),
    // 除了 `@babel/plugin-proposal-decorators`、`@babel/plugin-proposal-private-methods` 仍在提案阶段
    // 其他语法已经全部纳入 `@babel/preset-env`，无需单独安装语法插件
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          // 不需要该插件引入 polyfill
          // 默认就是 false
          corejs: false,
          // helper 函数从 @babel/runtime 引入
          // 默认就是 true
          helpers: true,
          version: require("@babel/runtime/package.json").version,
          // regeneratorRuntime 是否通过模块导入（Babel 7.18.0 后支持）
          // 如果为 false 则从全局作用域获取
          // 默认为 true
          regenerator: true,
        },
      ],
      isEnvProduction && [
        // 生产环境下移除老代码中的 PropTypes
        require("babel-plugin-transform-react-remove-prop-types").default,
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  };
};

export default function (api: any, opts: IBabelConfigCtx) {
  return getBabelPreset(opts);
}
