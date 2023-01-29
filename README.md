# vita-cli

覆盖整个应用研发周期的渐进式脚手架工具。

## Why

部门内部有很多存量老工程基于 React Static Boilerplate 搭建，工具链过于老旧，与现有技术生态不兼容，需要手动升级工具链、编写 Webpack 配置，不可避免存在大量重复性劳动。

该工具初期目标主要为了老工程快速升级 Webpack 5、Babel 7，并且附带了本人对 Webpack 配置优化最佳实践、Babel 配置最佳实践，只需要安装该命令行工具即可启用。

Vita-cli 内部 Webpack 配置基于 `webpack-chain`、TypeScript 编写，通过暴露 `chainWebpack` 配置，可以任意修改 Webpack 配置，尤其是 loader options、plugin options 修改非常方便。

Vita-cli 核心是插件机制，可以很方便地通过插件扩展功能，后期还会加入 `vita-plugin-yapi`、`vita-plugin-generator`、`vita-plugin-react-native` 等插件，目标是覆盖整个应用研发周期。

插件机制的另一个优点是可以按需启用功能。如果是一个新工程，不需要 `build-scripts`，但需要微生成器，则只需要安装 `vita-plugin-generator`，无需安装 `vita-plugin-build-scripts`，极大减小依赖体积，有助于提升 CI 环境依赖安装速度，进而提升 CI 构建效率。

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
