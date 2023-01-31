/**
 * 默认缓存目录
 */
export const CACHE_DIR = ".nei2dts";

/**
 * 支持解析的 Content-Type
 */
export const SUPPORT_CONTENT_TYPE = ["json"];

/**
 * 接口参数字段类型
 */
export enum IFieldTypeEnum {
  INT = "integer",
  BOOL = "boolean",
  OBJECT = "object",
  ARRAY = "array",
  NUMBER = "number",
  STRING = "string",
}

/**
 * YApi 类型到 TS 类型的映射
 */
export const PRIMITIVE_TYPE_MAPPING = {
  [IFieldTypeEnum.INT]: "number",
  [IFieldTypeEnum.NUMBER]: "number",
  [IFieldTypeEnum.BOOL]: "boolean",
  [IFieldTypeEnum.STRING]: "string",
} as const;

/**
 * 接口请求方法
 */
export enum RequestMethodsEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

/**
 * 接口方法名称前缀
 */
export const REQUEST_VERB_MAPPING = {
  [RequestMethodsEnum.GET]: "get",
  [RequestMethodsEnum.POST]: "save",
  [RequestMethodsEnum.PUT]: "update",
  [RequestMethodsEnum.DELETE]: "delete",
};
