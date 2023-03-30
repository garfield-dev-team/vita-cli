import { WebpackEnvEnum } from "./constants";
import type { IBabelConfigCtx } from "@study/vita-plugin-build-scripts";

/**
 * 配置参考：
 * https://github.com/umijs/umi/blob/master/packages/babel-preset-umi/src/index.ts
 * https://babeljs.io/docs/babel-preset-env#bugfixes
 */
export default (_context: any, opts: IBabelConfigCtx) => {
  const { env, useTypeScript, enableNewJsxTransform } = opts;

  const isEnvProduction = env === WebpackEnvEnum.PRODUCTION;

  return {
    presets: [
      useTypeScript && [
        "@babel/preset-typescript",
        {
          allowNamespaces: true,
          allowDeclareFields: true,
          // Why false?
          // 如果为 true，babel 只删除 import type 语句，会保留其他通过 import 引入的 type
          // 这些 type 引用走到 webpack 之后，就会报错
          // type-only imports 有啥作用
          // 当 import 一个类型的时候，编译器要移除这个 import，需要判断该 import 是否有副作用
          // 如果用 import type 导入，等于手动告诉编译器，该 import 没有副作用，可以直接移除
          onlyRemoveTypeImports: false,
          // 优化常量枚举
          // 由于 Babel 是单文件编译（相当于 TS 启用 `--isolatedModules` 配置）
          // 正常情况下，Babel 会将常量枚举转为普通枚举
          // 启用该配置后，如果常量枚举是非导出字段，则直接按常量枚举编译
          // 如果常量枚举是导出字段，则转译为 JS 对象
          optimizeConstEnums: true,
        },
      ],
      [
        "@babel/preset-env",
        {
          // 启用 `@babel/preset-modules` 特性，默认 false
          // 将高版本语法，转换为目标浏览器兼容的最接近的语法
          // 可以极大减小编译后的体积
          // Babel 8 将默认启用该配置
          bugfixes: true,
          // 更兼容 spec，但会变慢，所以不开
          spec: false,
          // 推荐用 top level 的 assumptions 配置
          loose: false,
          // 保留 ES Module 语法，交给 webpack 处理，用来支持 Tree-Shaking
          modules: false,
          // 使用 entry 方式，按照 target 配置全量引入 polyfill、以及提案阶段的 API
          // 需要注意，直接配置 `useBuiltIns: "entry"` 不会引入 polyfill
          // 还需要在入口文件中加一句 `import "core-js/stable";`
          // 建议根据适配目标合理配置 `browserslist`，以减小 polyfill 体积
          useBuiltIns: "entry",
          // 使用最新版本的 core-js
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
          // 使用最新版本的 @babel/runtime
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
