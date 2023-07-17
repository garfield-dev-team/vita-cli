// @ts-nocheck

import path from "node:path";
import svgo from "svgo";
import { parse } from "svg-parser";

const re = /<svg[^>]*>(.*?)<\/svg>/s;

const classicRuntimeFactory = ({ viewBox, height, width, fill, fileName }) => {
  return `import _extends from "@babel/runtime/helpers/extends";
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
export { ReactComponent };`;
};

const automaticRuntimeFactory = ({
  viewBox,
  height,
  width,
  fill,
  fileName,
}) => {
  return `import _objectSpread from "@babel/runtime/helpers/objectSpread2";
import { jsx as _jsx } from "react/jsx-runtime";
var ReactComponent = function ReactComponent(props) {
  return /*#__PURE__*/ _jsx(
    "svg",
    _objectSpread(
      _objectSpread(
        {
          viewBox: "${viewBox}",
          height: ${height},
          width: ${width},
          fill: "${fill}"
        },
        props
      ),
      {},
      {
        children: /*#__PURE__*/ _jsx("use", {
          xlinkHref: "#${fileName}"
        })
      }
    )
  );
};
export { ReactComponent };`;
};

module.exports = function (content: string) {
  this.cacheable && this.cacheable();

  const options = this.getOptions();
  const { enableNewJsxTransform = false, svgoConfig } = options;

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

  // 支持 automatic JSX transform
  const factory = enableNewJsxTransform
    ? automaticRuntimeFactory
    : classicRuntimeFactory;

  this.callback(null, factory({ viewBox, height, width, fill, fileName }));
};
