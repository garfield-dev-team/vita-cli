import os from "node:os";
import consola from "consola";
import { ICastDataNode, IConfig, IYApiResponseDataType } from "./types";
import {
  genInterfaceName,
  genMethodName,
  genTSDoc,
  getIndent,
  getYapiPageUrl,
} from "./utils";
import {
  IFieldTypeEnum,
  RequestMethodsEnum,
  SUPPORT_CONTENT_TYPE,
} from "./constants";
import { traverse } from "./dtsGenerator";

/**
 * TODO: 增加 query 参数类型
 * @param data
 */
const transformParams = (data: IYApiResponseDataType) => {
  return "";
};

const transformRequest = (data: IYApiResponseDataType) => {
  const { _id, req_body_type, req_body_other, project_id } = data;
  if (!SUPPORT_CONTENT_TYPE.includes(req_body_type)) {
    // const pageUrl = getYapiPageUrl(project_id, _id);
    // consola.warn(
    //   `不支持解析的类型：${req_body_type}\n` + `页面地址：${pageUrl}`,
    // );
    return "";
  }
  const root = JSON.parse(req_body_other) as ICastDataNode;
  const content = (
    root.type && root.type === IFieldTypeEnum.ARRAY
      ? traverse(root.items!.properties as ICastDataNode, 2, "array")
      : traverse(root.properties as ICastDataNode, 2, "object")
  ).join(os.EOL);
  return ["{", content].join(os.EOL);
};

const getPayloadWrapper = (wrapper: {
  url: string;
  method: string;
  params?: any;
  data?: any;
}) => {
  return [
    "{",
    ...Object.entries(wrapper).map(([key, value]) => {
      return `${getIndent(4)}${key}: ${value},`;
    }),
    `${getIndent(2)}}`,
  ].join(os.EOL);
};

export const generateApi = (data: IYApiResponseDataType, config: IConfig) => {
  const { path, method, project_id, _id, title } = data;
  const url = getYapiPageUrl(project_id, _id);
  const comments = genTSDoc(url, title);
  const methodName = genMethodName(data, config);
  const interfaceName = genInterfaceName(path, config);
  const requestParams = transformParams(data);
  const requestPayload = transformRequest(data).replace(/;$/, "");
  const hasParams = requestParams !== "";
  const hasData = requestPayload !== "";
  const payloadWrapper = getPayloadWrapper({
    url: `"${path}"`,
    method: `"${method}"`,
    ...(hasParams && { params: "payload" }),
    ...(hasData && { data: "payload" }),
  });
  const chunk = [
    comments,
    ...(!hasData && !hasParams
      ? [`export function ${methodName}() {`]
      : [
          `export function ${methodName}(payload: Partial<${requestPayload}>) {`,
        ]),
    `${getIndent(
      2,
    )}return request(${payloadWrapper}) as unknown as Promise<${interfaceName}>;`,
    "}",
    "",
  ].join(os.EOL);
  return [chunk, interfaceName] as const;
};

export const combineApiChunks = (
  data: (readonly [string, string])[],
  config: IConfig,
  groupName: string,
): string[] => {
  const { axoisImport, dtsImport } = config;
  const { types, chunks } = data.reduce<{
    types: string[];
    chunks: string[];
  }>(
    (accu, [chunk, interfaceName]) => {
      accu.chunks.push(chunk);
      accu.types.push(interfaceName);
      return accu;
    },
    {
      types: [],
      chunks: [],
    },
  );
  const args = `{ ${types.join(", ")} }`;
  const importTypeStmt = dtsImport
    ?.replace("$0", args)
    .replace("$1", groupName);
  const importChunk = [axoisImport, importTypeStmt, "", ""].join(os.EOL);
  return [importChunk, ...chunks];
};
