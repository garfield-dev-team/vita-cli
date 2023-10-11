# vita-cli

覆盖整个应用研发周期的渐进式脚手架工具。

## Packages

| Package                          | Version          | Desc                                       |
| -------------------------------- | ---------------- | ------------------------------------------ |
| @study/vita-cli                  | v1.0.9           | cli 核心库                                 |
| @study/create-vita-app           | v2.0.4           | 脚手架工具，可以快速创建项目模板           |
| @study/vita-app-polyfill         | v2.0.1           | language features polyfill                 |
| @study/vita-config-eslint        | v2.0.4           | ESLint 配置                                |
| @study/vita-plugin-build-scripts | v2.0.4           | 构建 CSR 应用插件                          |
| @study/vita-plugin-build-ssr     | Work In Progress | 构建 SSR 应用插件                          |
| @study/vita-plugin-generator     | Work In Progress | 微生成器插件                               |
| @study/vita-plugin-react-native  | Work In Progress | 构建 RN 工程插件                           |
| @study/vita-plugin-yapi          | v2.0.2           | 基于 Yapi 接口文档自动生成 TS 类型定义插件 |
| @study/vita-preset-babel         | v2.0.4           | Babel 配置                                 |
| @study/vita-preset-loader        | v2.0.1           | svg-loader、swc-loader                     |
| @study/vita-shared-utils         | v2.0.1           | Vita-cli 公共包                            |

## Why

部门内部现有的 CLI 工具存在哪些问题：

- 不支持插件机制，导致依赖必须全量安装。例如只想用 `rnbuild` 命令，但必须安装 `yktci` 所有命令的依赖，导致体积过大
- CLI 框架注册命令的时候，会加载所有命令所需的模块，后续命令多了之后启动性能下降（我理解的）

Vita-cli 是如何解决上述问题的：

### 1) 默认最小的 Install Size

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

### 2) 默认最快的初始化性能

对于 CLI 工具初始化效率问题，vita-cli 提出的方案是 Code-Splitting 按需加载。例如执行 `vita build` 命令的时候，只会加载 `build` 命令所需模块代码，不会加载到其他命令的模块，初始化效率保证 `O(1)` 时间复杂度，不会随命令增加而降低。

## Get started

> 建议本地自己拉一个开发分支，然后通过 Merge Request 提交代码

安装依赖：

```bash
$ pnpm install
```

打包构建：

```bash
$ pnpm run build:all
```

> 新同学可以快速过一遍整体代码逻辑，看一下各种配置文件。`examples` 里面是一个可以本地运行的业务工程

## 欢迎感兴趣的同学加入共建

我可以获得什么：

- 大型 Monorepo 项目开发经验
- Node + TypeScript 项目开发经验
- 参与解决复杂前端工程化问题
- 发现业务中的痛点，亲自编写工具解决，而且有机会被其他团队的同学使用
- 随时与 Vita Contributor 成员探讨前沿技术、职业发展、软技能等等
- 学到很多开源知识，提升日常开发技能
- 最重要的是，晋升可以作为加分项

## TODOs

- [ ] 接入 Changeset 发包流程
- [ ] 完善 `@study/vita-plugin-yapi` 插件，尝试解决 README 中最后两个 TODO
- [ ] 开发 `@study/vita-plugin-react-native` 插件，接入 React Native 打包流程
- [ ] 开发 `@study/vita-plugin-generator` 插件，可以参考 UMI 的微生成器方案：https://umijs.org/docs/guides/generator
- [ ] 开发 `@study/vita-plugin-build-ssr` 插件，调研 SSR 打包流程、相关工具链
- [ ] 调研 docusaurus 作为文档网站
