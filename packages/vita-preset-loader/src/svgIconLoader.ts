// @ts-nocheck

import path from "node:path";
import svgo from "svgo";
import { parse } from "svg-parser";

const re = /<svg[^>]*>(.*?)<\/svg>/s;

module.exports = function (content: string) {
  this.cacheable && this.cacheable();

  const options = this.getOptions();
  const { svgoConfig } = options;

  const plugin = this.svgIconPlugin;
  // `this.resourcePath` 拿到的是绝对路径
  const fileName = path.parse(this.resourcePath).name;
  const result = svgo.optimize(content, {
    ...svgoConfig,
    path: path.normalize(this.resourcePath),
  });
  const parsed = parse(result.data);
  const { fill, height, width, viewBox } = parsed.children[0].properties;

  const inner = result.data.replace(re, "$1").trim();
  const wrapped = `<symbol id="${fileName}" viewBox="${viewBox}">${inner}</symbol>`;

  plugin.putIcon(fileName, wrapped);

  // TODO: 支持 automatic JSX transform
  this.callback(
    null,
    `import _extends from "@babel/runtime/helpers/extends";
  import * as React from "react";
var ReactComponent = function ReactComponent(props) {
  return /*#__PURE__*/ React.createElement(
    "svg",
    _extends(
      {
        viewBox: "${viewBox}",
        height: ${height},
        width: ${width},
        fill: "${fill}"
      },
      props
    ),
    /*#__PURE__*/ React.createElement("use", {
      xlinkHref: "#${fileName}"
    })
  );
};
export { ReactComponent };
  `,
  );
};
