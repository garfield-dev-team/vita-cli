module.exports = {
  /** @type {import("@study/vita-plugin-build-scripts").IBuildOptions} */
  build: {
    // analyze: true,
    // codeSplitting: false,
    // enableNewJsxTransform: false,
    proxy: {},
    theme: {},
    chainWebpack(config) {
      // config.mode("development");
      config.devtool(false);
      config.optimization.minimize(false);

      config.externals({
        react: "React",
        "react-dom/client": "ReactDOM",
      });
    },
  },
  /** @type {import("@study/vita-plugin-yapi").IConfig} */
  yapi: {
    headers: {
      Cookie:
        "OUTFOX_SEARCH_USER_ID=831001039@10.108.160.105; OUTFOX_SEARCH_USER_ID_NCOO=109596519.82405193; _ga=GA1.2.1350315551.1660915834; fp=caf1435824a2354b39645435e566cfea; JSESSIONID=abcn_oavsubrS5SAdw7xy; _yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjkxLCJpYXQiOjE2NzUzMjMzNDEsImV4cCI6MTY3NTkyODE0MX0.0k9AOp6LEc5XQ7yXBLxteliAXIkO02MCUpK0qLJAdPs; _yapi_uid=91",
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
