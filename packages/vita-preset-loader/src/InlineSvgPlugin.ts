// @ts-nocheck

import type { Compiler, WebpackPluginInstance } from "webpack";
import NormalModule from "webpack/lib/NormalModule";
import HtmlWebpackPlugin from "html-webpack-plugin";

class InlineSvgPlugin implements WebpackPluginInstance {
  private iconMap: Record<string, string> = {};

  public static loader = require.resolve("./svgIconLoader");

  public apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("InlineSvgPlugin", (compilation) => {
      // 导入 NormalModule 需要避免 webpack 多实例问题
      NormalModule.getCompilationHooks(compilation).loader.tap(
        "InlineSvgPlugin",
        (loaderContext) => {
          // @ts-ignore
          loaderContext.svgIconPlugin = this;
        },
      );

      // 注意，`normalModuleLoader` 在 Webpack5 已经废弃了，建议用上面方法替代
      // compilation.hooks.normalModuleLoader.tap(
      //   "InlineSvgPlugin",
      //   (loaderContext) => {
      //     // @ts-ignore
      //     loaderContext.svgIconPlugin = this;
      //   },
      // );

      // HtmlWebpackPlugin 也需要确保全局单例，这样才能监听事件钩子
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.afterTemplateExecution.tapAsync(
        "InlineSvgPlugin",
        (htmlPluginData, callback) => {
          // your code
          if (Object.keys(this.iconMap).length > 0) {
            let htmlContent = htmlPluginData.html;
            const icons = Object.values(this.iconMap).join("");
            htmlContent = htmlContent.replace(
              "<body>",
              `<body><svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${icons}</svg>`,
            );
            htmlPluginData.html = htmlContent;
          }

          return typeof callback === "function"
            ? callback(null, htmlPluginData)
            : htmlPluginData;
        },
      );
    });
  }

  public putIcon(name: string, content: string) {
    this.iconMap[name] = content;
  }
}

export default InlineSvgPlugin;
