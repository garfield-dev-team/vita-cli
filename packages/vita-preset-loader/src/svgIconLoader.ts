// @ts-nocheck

import path from "node:path";
import { parse } from "svg-parser";

module.exports = function (content: string) {
  this.cacheable && this.cacheable(false);

  const plugin = this.svgIconPlugin;
  // `this.resourcePath` 拿到的是绝对路径
  const fileName = path.parse(this.resourcePath).name;
  const parsed = parse(content);
  const { fill, height, width, viewBox } = parsed.children[0].properties;

  const inner = content.replace(/<svg[^>]*>(.*?)<\/svg>/s, "$1").trim();
  const wrapped = `<symbol id="${fileName}" viewBox="${viewBox}" height="${height}" width="${width}" fill="${fill}">${inner}</symbol>`;

  plugin.putIcon(fileName, wrapped);

  this.callback(
    null,
    `import * as React from "react";
var ReactComponent = function ReactComponent(props) {
  return /*#__PURE__*/ React.createElement(
    "svg",
    props,
    /*#__PURE__*/ React.createElement("use", {
      xlinkHref: "#${fileName}"
    })
  );
};
export { ReactComponent };`,
  );
};
