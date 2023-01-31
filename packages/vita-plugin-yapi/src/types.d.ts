import { IFieldTypeEnum, RequestMethodsEnum } from "./constants";

export type IConfig = Partial<{
  headers: Record<string, string>; // 获取接口文档数据的请求头
  savePath: string;
  declarationPath: string; // 类型声明文件保存路径
  apiPath: string; // 接口请求模块保存路径
  axoisImport: string;
  dtsImport: string;
  ignorePrefix: string[]; // 默认会根据接口请求路径给 Type Alias 命名，可以过滤路径中不需要的片段
  apiGroup: Record<string, string[]>; // api 分组，根据这个关系直接映射到文件
}>;

export type IPayload = {
  params?: Record<string, any>;
  headers?: Record<string, string>;
};

export type IYApiResponseDataType = {
  method: RequestMethodsEnum;
  path: string;
  project_id: number;
  req_body_other: string;
  req_body_type: string;
  req_query: unknown[];
  res_body: string;
  res_body_type: string;
  title: string;
  up_time: number;
  _id: number;
};

export type IYApiResponse = {
  errcode: number;
  data: IYApiResponseDataType;
};

/**
 * 基本类型
 */
export type IPrimitiveValue =
  | IFieldTypeEnum.INT
  | IFieldTypeEnum.BOOL
  | IFieldTypeEnum.NUMBER
  | IFieldTypeEnum.STRING;

export type ICastDataNode = {
  type: IFieldTypeEnum;
  properties?: ICastDataNode; // 仅当 type 为 "object"
  items?: ICastDataNode; // 仅当 type 为 "array"
  default?: any;
  description?: string;
};
