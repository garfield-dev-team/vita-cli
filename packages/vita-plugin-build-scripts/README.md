# @study/vita-plugin-build-scripts

## Why

部门内部有很多存量老工程基于 React Static Boilerplate 搭建，工具链过于老旧，与现有技术生态不兼容，需要手动升级工具链、编写 Webpack 配置，不可避免存在大量重复性劳动。

该工具初期目标主要为了老工程快速升级 Webpack 5、Babel 7，整体使用体验与 CRA 类似，并且附带了 Webpack 配置优化最佳实践、Babel 配置最佳实践，只需要安装该命令行工具即可启用。为什么不直接用 CRA 或者 `react-scripts`，CRA 主要问题是配置不透明，而且很难根据业务需求进行定制（例如 `SplitChunks`），而且 CRA 只能构建单入口的 SPA 应用，不支持多入口，也不支持 SSR 应用，无法满足复杂业务场景需要。更重要的原因是，CRA 停止维护超过 5 个月（2022/4/13 发布 v5.0.1 之后就没有再更新过），已经积累了超过 1500 个 issue。

Vita-cli 内部 Webpack 配置基于 `webpack-chain`、TypeScript 编写，通过暴露 `chainWebpack` 配置，可以任意修改 Webpack 配置，尤其是 loader options、plugin options 修改非常方便。除了直接修改 Webpack 配置，vita-cli 借鉴 UMI 加入了一些 **启发性配置**，无需关系配置细节，可以专注于业务开发。

## Usage

安装依赖：

```bash
$ pnpm add @study/vita-cli @study/vita-plugin-build-scripts @babel/runtime
```

> 注意，由于 PNPM 默认创建半严格 `node_modules`，允许第三方库访问未声明依赖，不允许业务代码访问未声明依赖，因此 `@babel/runtime` 需要作为业务工程的 `dependencies`

注意 `@study/vita-plugin-build-scripts` 默认不带 polyfill，如需 polyfill 可以在前端工程安装 `core-js`：

```bash
$ pnpm add core-js
```

然后在入口文件引入：

```ts
import "core-js/stable";
```

本地开发：

```bash
$ vita start
```

生产环境打包：

```bash
$ vita build
```

## CLI Options

### 1) `vita serve`

| Options         |                                     |
| --------------- | ----------------------------------- |
| `--host [host]` | Specify hostname (`string`)         |
| `--port <port>` | Specify port (`number`)             |
| `--https`       | Use TLS + HTTP/2 (`boolean`)        |
| `--open`        | Open browser on startup (`boolean`) |

### 2) `vita build`

| Options     |                                           |
| ----------- | ----------------------------------------- |
| `--analyze` | Build and run bundle analyzer (`boolean`) |

## Config Reference

### 1) `@study/vita-plugin-build-scripts`

配置文件：

```ts
export type IBuildOptions = {
  // 是否启用 webpack-bundle-analyzer
  // 默认值 false
  analyze?: boolean;
  // 启用内置的分包策略，将 `@study` 前缀依赖视为业务组件库单独拆包，antd 每个组件单独拆包，优化缓存
  // 默认开启，可以配置 `false` fallback 到 Webpack 默认缓存组策略
  codeSplitting?: boolean;
  // 是否启用 automatic JSX
  // 默认启用，可以配置 `false` fallback 到 classic JSX
  enableNewJsxTransform?: boolean;
  // 配置代理功能，仅在 dev 时有效
  proxy?: {};
  // 提供给 less-loader 的主题变量
  theme?: {};
  // 用链式编程的方式修改 webpack 配置，基于 webpack-chain
  // 具体 API 可参考 webpack-api 的文档。
  chainWebpack?: (config: Config) => void;
  modifyWebpackConfig?: webpack.Configuration;
};
```

环境变量：

```bash
# 打包输出路径，默认值 dist
BUILD_PATH=dist

# assets 和 public 的静态资源前缀
PUBLIC_URL=/zhikao/

# 是否生成 soucemap，开发环境默认启用，生产环境默认禁用
GENERATE_SOURCEMAP=false

# 用户自定义环境变量
REACT_APP_ENV=production

REACT_APP_KE=https://ke.study.163.com
REACT_APP_STUDY=https://study.163.com
```
