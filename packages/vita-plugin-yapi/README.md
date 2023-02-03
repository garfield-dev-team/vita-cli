# @study/vita-plugin-yapi

接口自动化工具：

- 从接口文档生成 `.d.ts` 声明文件
- 从接口文档生成接口请求方法

Features：

- 直接格式化输出，附带 jsdoc
- 如果接口文档里面有注释的，也会给加上
- 可以根据接口分组，直接映射到文件路径
- 内置缓存功能，类型定义文件的生成是增量的，如果接口文档没有修改不会重复生成

## Why

TypeScript 已经成为前端工程化的重要工具，越来越多的项目都在逐步迁移到 TypeScript。TypeScript 带来的收益十分明显，在代码健壮性、可读性、开发效率与开发体验等多个方面，都能带来显著提升。正确编写 TS 类型注解能有效保障工程质量，在开发阶段规避 90% 以上类型错误，提升代码可维护性，同时 VS Code 也能提供更好的 intellisense。

在前端业务工程中，绝大对数类型都来自后端接口返回的数据。但由于迭代时间紧、接口数量大，手动编写 TS 类型定义效率太低，再加上种种原因（例如部分同事对 TS 掌握程度一般，或者迭代时间紧，没有时间解决类型错误），导致实际业务工程中，接口请求完全没有类型信息，存在大量隐式 any 问题。这种情况下，TS 无法发挥类型检查作用，不仅开发体验差，VS Code 没有 intellisense，而且存在各种空指针隐患，以至于同事都学会了一项特殊技能，一言不合就用 `?.` 可选链语法，导致满屏都是可选链，极大影响开发体验，增加了维护难度。

该接口自动化工具，可以彻底解决以上问题。具有以下特点：

- 可以根据 YApi 接口文档，自动生成 d.ts 类型定义和接口请求代码
- 所有代码支持格式化输出，可读性好；
- 自动添加 tsdoc 注释，点击注释中的链接可打开接口文档；
- 自动提取接口文档字段注释，进一步提升维护性；
- 开发者完全没有心智负担，接口请求入参、返回值都有类型定义，直接调接口就能享受到类型定义；
- 关键还节省大量时间，几秒内就可以生成全部类型定义，当后端接口文档变更，可以随时进行同步；
- 最重要的是，降低 TS 学习门槛、提升开发效率、激发大家对 TS 的学习热情。

推荐在大型、多人参与的项目中使用，存量老工程也可以使用。即使 JS 项目也可以通过 jsdoc 进行支持使用。彻底告别各种隐式 any 问题，零成本实现 Type Safe，极大提升开发效率，提升 TS 下的开发体验。

## Get started

首先安装依赖：

```bash
$ pnpm add @study/vita-cli
$ pnpm add @study/vita-plugin-yapi -D
```

在根目录创建一份配置文件，配置文件可以是以下类型中的一种：

```ts
export const DEFAULT_CONFIG_FILES = [
  ".vitarc",
  "vita.config.js",
  "vita.config.cjs",
];
```

编写配置文件内容如下：

```js
module.exports = {
  /** @type {import("@study/vita-plugin-yapi").IConfig} */
  yapi: {
    headers: {
      // 必填，YApi 登录的 Cookie
      Cookie: "",
    },
    // 类型声明文件保存路径
    declarationPath: "src/types",
    // 接口请求方法保存路径
    apiPath: "src/api",
    // axios 的 import 语句（需要生成接口请求方法的时候提供）
    axoisImport: 'import request from "@/utils/request"',
    // 类型声明的 import  语句（需要生成接口请求方法的时候提供）
    dtsImport: 'import $0 from "@/types/$1"',
    // 默认会根据接口请求路径给 Type Alias 命名
    // 可以过滤路径中不需要的片段
    ignorePrefix: [
      "/vip-service",
      "/vip-manager",
      "/user-manager",
      "/user-service",
      "/wx",
      "/vip",
      "/get",
    ],
    // api 分组，根据这个关系直接映射到文件
    apiGroup: {
      comm: [
        "http://yapi.study.youdao.com/project/52/interface/api/8661",
        "http://yapi.study.youdao.com/project/52/interface/api/16697",
        "http://yapi.study.youdao.com/project/52/interface/api/16504",
        "http://yapi.study.youdao.com/project/52/interface/api/16819",
        "http://yapi.study.youdao.com/project/52/interface/api/16766",
      ],
      mime: ["http://yapi.study.youdao.com/project/52/interface/api/16688"],
      userPlan: [
        "http://yapi.study.youdao.com/project/52/interface/api/16503",
        "http://yapi.study.youdao.com/project/52/interface/api/16995",
        "http://yapi.study.youdao.com/project/52/interface/api/16505",
      ],
    },
  },
};
```

执行命令生成类型声明和接口请求函数代码：

```bash
$ vita yapi
```

> 注意还会同时生成一个缓存目录 `.vita`，建议提交到仓库，多人开发可以复用缓存

只生成类型声明：

```bash
$ vita yapi --dts
```

> 该操作是非侵入性的，只生成类型声明文件，对业务工程代码没有影响

## TODOs

- 类型定义抽提公共 DTO 类，便于复用
- 类型参数支持联合类型，例如 `title: string | null;` 或者 `title?: string;`
