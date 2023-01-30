# vita-cli

覆盖整个应用研发周期的渐进式脚手架工具。

## Packages

| Package                          | Version          | Desc                                       |
| -------------------------------- | ---------------- | ------------------------------------------ |
| @study/vita-cli                  | v1.0.0           | 云课堂公共 cli 工具                        |
| @study/vita-plugin-build-scripts | v1.0.0           | 构建 CSR 应用插件                          |
| @study/vita-plugin-build-ssr     | Work In Progress | 构建 SSR 应用插件                          |
| @study/vita-plugin-generator     | Work In Progress | 微生成器插件                               |
| @study/vita-plugin-yapi          | Work In Progress | 基于 Yapi 接口文档自动生成 TS 类型定义插件 |
| @study/vita-plugin-react-native  | Work In Progress | 构建 RN 工程插件                           |

## Why

部门内部有很多存量老工程基于 React Static Boilerplate 搭建，工具链过于老旧，与现有技术生态不兼容，需要手动升级工具链、编写 Webpack 配置，不可避免存在大量重复性劳动。

该工具初期目标主要为了老工程快速升级 Webpack 5、Babel 7，整体使用体验与 CRA 类似，并且附带了 Webpack 配置优化最佳实践、Babel 配置最佳实践，只需要安装该命令行工具即可启用。为什么不直接用 CRA 或者 `react-scripts`，CRA 主要问题是配置不透明，而且很难根据业务需求进行定制（例如 `SplitChunks`），而且 CRA 只能构建单入口的 SPA 应用，不支持多入口，也不支持 SSR 应用，无法满足复杂业务场景需要。

Vita-cli 内部 Webpack 配置基于 `webpack-chain`、TypeScript 编写，通过暴露 `chainWebpack` 配置，可以任意修改 Webpack 配置，尤其是 loader options、plugin options 修改非常方便。除了直接修改 Webpack 配置，vita-cli 借鉴 UMI 加入了一些 **启发性配置**，无需关系配置细节，可以专注于业务开发。

部门内部现有的 CLI 工具存在哪些问题：

https://g.hz.netease.com/ykt-adult-front/cicd/yktci

- 不支持插件机制，导致依赖必须全量安装。例如只想用 `rnbuild` 命令，但必须安装 `yktci` 所有命令的依赖，导致体积过大
- CLI 框架注册命令的时候，会加载所有命令所需的模块，后续命令多了之后启动性能下降

Vita-cli 是如何解决上述问题的：

### 默认最小的 Install Size

依赖体积过大会直接影响 CI 环境依赖安装速度，进而降低 CI 构建效率。Vita-cli 非常注重 Install Size，提出了如下解决方案。

Vita-cli 核心是插件机制，可以很方便地通过插件扩展功能，后期还会加入 `vita-plugin-yapi`、`vita-plugin-generator`、`vita-plugin-react-native` 等插件，目标是覆盖整个应用研发周期。插件机制最大优点是可以按需启用功能。如果是一个新工程，不需要 `build-scripts`，但需要微生成器，则只需要安装 `vita-plugin-generator`，无需安装 `vita-plugin-build-scripts`，极大减小依赖体积。

Vita-cli 还支持依赖分割。假设 `vita-plugin-generator` 只需在开发环境启用，而 `vita-plugin-build-scripts` 需要在开发环境和生产环境启用，那么 `vita-plugin-generator` 就无需在 CI 环境安装。建议的依赖安装关系如下：

```json
{
  "dependencies": {
    "@study/vita-cli": "^1.0.0",
    "@study/vita-plugin-build-scripts": "^1.0.0"
  },
  "devDependencies": {
    "@study/vita-plugin-generator": "^1.0.0"
  }
}
```

CI 环境安装依赖的时候，可以执行下面的命令，排除 `devDependencies` 节点下的依赖：

```bash
$ yarn install --production
# or
$ pnpm install --prod
```

此时，vita-cli 只会初始化 `vita-plugin-build-scripts` 插件，`vita build` 命令可以正常使用，减少了 CI 环境不必要的依赖，有助于提升 CI 构建效率。

### 默认最快的初始化性能

对于 CLI 工具初始化效率问题，vita-cli 提出的方案是 Code-Splitting 按需加载。例如执行 `vita build` 命令的时候，只会加载 `build` 命令所需模块代码，不会加载到其他命令的模块，初始化效率保证 `O(1)` 时间复杂度，不会随命令增加而降低。

## Get started

安装依赖：

```bash
$ pnpm add @study/vita-cli @study/vita-plugin-build-scripts
```

> 业务工程中建议作为 `dependencies` 进行安装

本地开发：

```bash
$ vita start
```

生产环境打包：

```bash
$ vita build
```
