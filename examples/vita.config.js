module.exports = {
  /** @type {import("@study/vita-plugin-build-scripts").IBuildOptions} */
  build: {
    // analyze: true,
    // codeSplitting: false,
    // enableNewJsxTransform: false,
    proxy: {},
    theme: {},
  },
  yapi: {
    headers: {
      Cookie:
        "fp=176a891bfb408852e9a2b6f96c83c40f; AUTH_TOKEN=456cd186a2d843d0bfbe8cb8a4070ea7; USER_INFO=eyJhY2NvdW50IjoiMjAyMjk5OSIsImFjY291bnRUeXBlIjoxLCJhdmF0YXIiOiJodHRwOi8vYmlmcm9zdC55b3VkYW8uY29tL2FwaS9yZXNvdXJjZS9iaWZyb3N0L3N0b3JhZ2UvNWViNWJlM2E2OWE4NDJiMDg0MGIyMTVkYTI1NTAyNTMucG5nIiwibmlja05hbWUiOiLliJ3lpI8iLCJyb2xlcyI6WyJ0ZWFjaGVyIl0sInN0YXR1cyI6MywidXNlcklkIjoxMDA2NTAwfQ==; OUTFOX_SEARCH_USER_ID=1975872700@10.110.96.160; OUTFOX_SEARCH_USER_ID_NCOO=1199165372.4386883; _yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjkxLCJpYXQiOjE2NzAyMzM4NjcsImV4cCI6MTY3MDgzODY2N30.3z-ydkMBgQfaxkpvz1aFBEhlHg5qBb0y8LKlHqDjpug; _yapi_uid=91",
    },
    declarationPath: "src/types",
    apiPath: "src/api",
    axoisImport: 'import request from "@/utils/request"',
    dtsImport: 'import $0 from "@/types/$1"',
    ignorePrefix: [
      "/vip-service",
      "/vip-manager",
      "/user-manager",
      "/user-service",
      "/wx",
      "/vip",
      "/get",
    ],
    apiGroup: {
      comm: [
        "http://yapi.study.youdao.com/project/52/interface/api/8661",
        "http://yapi.study.youdao.com/project/52/interface/api/16697",
        "http://yapi.study.youdao.com/project/52/interface/api/16504",
        "http://yapi.study.youdao.com/project/52/interface/api/16819",
        "http://yapi.study.youdao.com/project/52/interface/api/16766",
      ],
      mime: ["http://yapi.study.youdao.com/project/52/interface/api/16688"],
      userPlan: [
        "http://yapi.study.youdao.com/project/52/interface/api/16503",
        "http://yapi.study.youdao.com/project/52/interface/api/16995",
        "http://yapi.study.youdao.com/project/52/interface/api/16505",
      ],
    },
  },
};
