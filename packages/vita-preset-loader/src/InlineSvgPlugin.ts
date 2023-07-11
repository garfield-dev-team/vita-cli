// @ts-nocheck

import type { Compiler, WebpackPluginInstance } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

class InlineSvgPlugin implements WebpackPluginInstance {
  private iconMap: Record<string, string> = {};

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("InlineSvgPlugin", (compilation) => {
      // webpack.NormalModule.getCompilationHooks(compilation).loader.tap(
      //   "InlineSvgPlugin",
      //   (loaderContext) => {
      //     // @ts-ignore
      //     loaderContext.svgIconPlugin = this;
      //   },
      // );
      compilation.hooks.normalModuleLoader.tap(
        "InlineSvgPlugin",
        (loaderContext) => {
          // @ts-ignore
          loaderContext.svgIconPlugin = this;
        },
      );

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
              `<body><svg xmlns="http://www.w3.org/2000/svg">${icons}</svg>`,
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

  putIcon(name: string, content: string) {
    this.iconMap[name] = content;
  }
}

export default InlineSvgPlugin;
