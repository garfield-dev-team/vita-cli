# @study/vita-app-polyfill

`@study/vita-plugin-build-scripts` 默认不提供 ES language features polyfill，如需使用 polyfill，则可以使用该包。

安装：

```bash
$ pnpm add @study/vita-app-polyfill
```

在入口文件引入：

```tsx
import "@study/vita-app-polyfill";
```

> 建议根据适配目标合理配置 `browserslist`，以减小 polyfill 体积
