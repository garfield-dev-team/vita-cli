import os from "node:os";
import consola from "consola";
import {
  ICastDataNode,
  IConfig,
  IPrimitiveValue,
  IYApiResponseDataType,
} from "../types/global";
import {
  IFieldTypeEnum,
  PRIMITIVE_TYPE_MAPPING,
  SUPPORT_CONTENT_TYPE,
} from "../utils/constants";
import {
  genInterfaceName,
  genTSDoc,
  getIndent,
  getYapiPageUrl,
} from "../utils/helper";

const genInlineComments = (description?: string) => {
  return description ? ` // ${description}` : "";
};

export const traverse = (
  root: ICastDataNode,
  tabSize: number,
  type: "object" | "array",
) => {
  const list = Object.entries(root).reduce<string[]>((accu, [key, value]) => {
    const indent = getIndent(tabSize);
    switch (value.type) {
      case IFieldTypeEnum.INT:
      case IFieldTypeEnum.BOOL:
      case IFieldTypeEnum.NUMBER:
      case IFieldTypeEnum.STRING:
        const inlineComments = genInlineComments(value.description);
        const list = [
          indent,
          `${key}: `,
          `${PRIMITIVE_TYPE_MAPPING[value.type as IPrimitiveValue]};`,
          inlineComments,
        ];
        accu.push(list.join(""));
        break;
      case IFieldTypeEnum.OBJECT:
        accu.push(`${indent}${key}: {`);
        accu.push(
          ...traverse(
            value.properties as ICastDataNode,
            tabSize + 2,
            IFieldTypeEnum.OBJECT,
          ),
        );
        break;
      case IFieldTypeEnum.ARRAY:
        if (
          [
            IFieldTypeEnum.INT,
            IFieldTypeEnum.BOOL,
            IFieldTypeEnum.NUMBER,
            IFieldTypeEnum.STRING,
          ].includes(value.items.type)
        ) {
          // 基本类型数组
          const inlineComments = genInlineComments(value.description);
          const list = [
            indent,
            `${key}: `,
            `${PRIMITIVE_TYPE_MAPPING[value.items.type as IPrimitiveValue]}[];`,
            inlineComments,
          ];
          accu.push(list.join(""));
        } else {
          // 对象数组
          accu.push(`${indent}${key}: {`);
          accu.push(
            ...traverse(
              (value.items as ICastDataNode).type === IFieldTypeEnum.OBJECT
                ? value.items.properties
                : value.items,
              tabSize + 2,
              IFieldTypeEnum.ARRAY,
            ),
          );
        }
        break;
      default:
        break;
    }

    return accu;
  }, []);

  const tailingBracket = [
    getIndent(tabSize - 2),
    type === IFieldTypeEnum.OBJECT ? "};" : "}[];",
  ].join("");

  return [...list, tailingBracket];
};

const transformResponse = ({
  root,
  url,
  title,
  path,
  config,
}: {
  root: ICastDataNode;
  url: string;
  title: string;
  path: string;
  config: IConfig;
}) => {
  const comments = genTSDoc(url, title);
  const interfaceName = genInterfaceName(path, config);
  const content = (
    root.type && root.type === IFieldTypeEnum.ARRAY
      ? traverse(root.items!.properties as ICastDataNode, 2, "array")
      : traverse(root.properties as ICastDataNode, 2, "object")
  ).join(os.EOL);
  return [comments, `export type ${interfaceName} = {`, content, "", ""].join(
    os.EOL,
  );
};

export const generateDts = (data: IYApiResponseDataType, config: IConfig) => {
  const { _id, title, path, res_body_type, res_body, project_id } = data;
  const pageUrl = getYapiPageUrl(project_id, _id);
  if (!SUPPORT_CONTENT_TYPE.includes(res_body_type)) {
    consola.warn(
      `不支持解析的类型：${res_body_type}\n` + `页面地址：${pageUrl}`,
    );
    return "";
  }
  const dataNode = JSON.parse(res_body) as ICastDataNode;
  return transformResponse({
    root: dataNode,
    title,
    url: pageUrl,
    path,
    config,
  });
};
