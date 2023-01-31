import fetch, { Headers, Request } from "node-fetch";
import { IPayload, IYApiResponse } from "./types";

const BASE_URL = "http://yapi.study.youdao.com/api/interface/get";

const getDefaultHeaders = () => {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  };
};

export const request = async ({ params = {}, headers = {} }: IPayload) => {
  const requestURL = Object.entries(params).reduce((accu, [key, value]) => {
    accu.searchParams.append(key, value);
    return accu;
  }, new URL(BASE_URL));

  const requestHeaders = Object.entries({
    ...getDefaultHeaders(),
    ...headers,
  }).reduce((accu, [key, value]) => {
    accu.append(key, value);
    return accu;
  }, new Headers());

  const request = new Request(requestURL.toString(), {
    method: "GET",
    headers: requestHeaders,
  });

  return fetch(request).then((res) => res.json() as Promise<IYApiResponse>);
};
