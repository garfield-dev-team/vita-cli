import fs from "node:fs";
import path from "node:path";
// @ts-ignore
import resolve from "resolve";
import webpack from "webpack";
import Config from "webpack-5-chain";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
// @ts-ignore
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
// @ts-ignore
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import Webpackbar from "webpackbar";
// @ts-ignore
import BundleAnalyzerPlugin from "webpack-bundle-analyzer/lib/BundleAnalyzerPlugin";
import {
  appPath,
  appBuild,
  appHtml,
  appIndexJs,
  appSrc,
  appTsConfig,
  appNodeModules,
  appWebpackCache,
  appTsBuildInfoFile,
} from "./paths";
import { addCSSRules } from "./cssRule";
import { IS_CI_ENV, WebpackEnvEnum } from "../utils/constants";
import { IBuildOptions } from "../types/global";
import { getClientEnviron } from "../utils/helpers";

type IOpts = {
  env: WebpackEnvEnum;
} & IBuildOptions;

export type ICSSRuleConfigCtx = {
  env: WebpackEnvEnum;
  config: Config;
  forceInlineStyle: boolean;
  theme: {};
  shouldUseSourceMap: boolean;
};

export type IBabelConfigCtx = {
  env: WebpackEnvEnum;
  useTypeScript: boolean;
  enableNewJsxTransform: boolean;
};

function isModuleCSS(module: { type: string }) {
  return (
    // mini-css-extract-plugin
    module.type === `css/mini-extract` ||
    // extract-css-chunks-webpack-plugin (old)
    module.type === `css/extract-chunks` ||
    // extract-css-chunks-webpack-plugin (new)
    module.type === `css/extract-css-chunks`
  )
}

export async function configFactory({
  env,
  analyze = false,
  codeSplitting = true,
  cssSplitting = true,
  enableNewJsxTransform = true,
  forceInlineStyle = false,
  proxy,
  theme = {},
  chainWebpack,
  modifyWebpackConfig,
}: IOpts) {
  const isEnvDevelopment = env === WebpackEnvEnum.DEVELOPMENT;
  const isEnvProduction = env === WebpackEnvEnum.PRODUCTION;
  const stringifiedEnv = getClientEnviron(isEnvDevelopment);
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false' || isEnvDevelopment;
  const emitErrorsAsWarnings = process.env.ESLINT_NO_PROD_ERRORS === 'true';
  const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';
  const useTypeScript = fs.existsSync(appTsConfig);

  const config = new Config();

  const cssRuleContext: ICSSRuleConfigCtx = {
    env,
    config,
    forceInlineStyle,
    theme,
    shouldUseSourceMap,
  };

  const babelConfigContext: IBabelConfigCtx = {
    env,
    useTypeScript,
    enableNewJsxTransform
  }

  // mode
  config.mode(isEnvDevelopment ? "development" : "production");
  // 生产环境打包，遇到报错直接退出进程
  // 本地开发 watch mode 不建议启用，否则一旦遇到报错 Webpack 就会退出打包，影响开发体验
  config.bail(isEnvProduction);
  config.stats("errors-warnings");
  config.infrastructureLogging({ level: "error" });

  // entry
  config.entry("main").add(appIndexJs);

  // devtool
  config.devtool(
    isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      // 开发环境用 eval-cheap-module-source-map 会存在一个问题
      // 没办法通过 source 面板调试第三方库的代码
      // 还是改用 cheap-module-source-map
      : isEnvDevelopment && 'cheap-module-source-map',
  );

  // output
  config.output
    .path(appBuild)
    // Initial Chunk 文件名
    // 其中 name 为 chunkId，对于 Initial Chunk 来说是固定的
    // 取决于 entry 配置，如果不配置默认 main
    .filename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].js",
    )
    // Async Chunk 和 SplitChunks 分包的文件名
    // 其中 name 为 chunkId
    // 如果用 SplitChunks 分包，则取决于 SplitChunks 配置
    // 如果用 `import()` 做 Code-Splitting 分包，取决于 `optimization.chunkIds` 配置
    // Webpack 内部有一套默认生成策略，开发环境下用 named chunkId，基于文件路径，便于调试产物
    // 生产环境下用 deterministic chunkId，一般是三位数字哈希，有利于生产环境缓存复用
    .chunkFilename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js",
    )
    // .assetModuleFilenamet("static/media/[name].[hash][ext]")
    .publicPath(process.env.PUBLIC_URL || "auto")
    // Assets Module 打包静态资源的文件名
    .set("assetModuleFilename", "static/media/[name].[hash][ext]")
    // 选择更加快速的哈希函数，
    // v5.54.0+ 支持 xxhash64
    .set("hashFunction", "xxhash64");
    // .clean(true);

  // resolve
  // prettier-ignore
  config.resolve
    .modules
      .add("node_modules")
      .end()
    .alias
      .merge({
        "@": appSrc,
      })
      .end()
    .extensions
      // 常用后缀放在前面可提升匹配速度
      .merge([".ts", ".tsx", ".js", ".jsx", ".json", ".wasm"])
      .end();

  // rules
  // prettier-ignore
  config.module
    .rule("js")
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .include
        .add([appSrc])
        .end()
      .use("babel-loader")
        .loader(require.resolve("babel-loader"))
        .options({
          presets: [
            [
              require.resolve("@study/vita-preset-babel"),
              babelConfigContext,
            ]
          ],
          babelrc: false,
          configFile: false,
          plugins: [
            // 开发环境启用 `react-refresh` 热更新 React 组件
            isEnvDevelopment && require.resolve("react-refresh/babel"),
          ].filter(Boolean),
          // 启用 babel-loader 缓存能力
          // Webpack5 自带的持久化缓存粒度太大，修改配置文件就会导致缓存失效
          cacheDirectory: true,
          cacheCompression: false,
          compact: isEnvProduction,
        })
        .end()
      .end();

  addCSSRules(cssRuleContext);

  config.module
    .rule("svg")
    .test(/\.svg$/)
      .oneOf("svgr")
        // 配置参考：
        // https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/src/webpackUtils.ts#L112

        // We don't want to use SVGR loader for non-React source code
        // ie we don't want to use SVGR for CSS files...
        // 通过 issuer 判断，如果 JS、TS 等模块引用 SVG，则转为 React 组件
        // 如果 CSS 模块引用 SVG，则用 Assets Module 将其视为静态资源进行打包
        .issuer(/\.[jt]sx?$/)
        .use("svgr-loader")
          // .loader(require.resolve('@svgr/webpack'))
          .loader(require.resolve("@study/vita-preset-loader/dist/svgr"))
          .options({
            // 始终用 named export 方式导出 React 组件
            exportType: "named",
            prettier: false,
            // 启用 svgo 优化
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeTitle: false,
                    },
                  },
                },
                'prefixIds',
              ],
            },
            titleProp: true,
            ref: true,
          })
          .end()
        .end()
      .oneOf("asset")
        .type("asset")
        .end();

  config.module
    .rule("font")
    .test(/\.(woff|woff2|ttf|eot)$/)
    .exclude
      .add(/node_modules/)
      .end()
    .type("asset")
    .end();

  config.module
    .rule("image")
    .test(/\.(png|jpg|gif|jpeg|ico|cur|webp|avif)$/)
    .exclude
      .add(/node_modules/)
      .end()
    .type("asset")
    .end();

  // cache
  config.cache({
    type: "filesystem",
    cacheDirectory: appWebpackCache,
    store: "pack",
    buildDependencies: {
      defaultWebpack: ["webpack/lib/"],
      config: [__filename],
      tsconfig: useTypeScript ? [appTsConfig] : [],
    },
  });

  // devServer
  config.devServer
    .set("static", appBuild)
    .compress(true)
    .hot(true)
    .proxy(proxy)
    // .open(true)
    // 支持历史模式路由重定向
    .historyApiFallback({
      disableDotRule: true,
      // 本地开发路由支持路径前缀，与线上部署保持一致
      index: process.env.PUBLIC_URL || "/",
    })
    // 本地开发支持 local 域名访问，便于透传 Cookie
    .allowedHosts
      .add("all")
      .end()
    .headers({
      "access-control-allow-origin": "*",
    })
    .host("0.0.0.0")
    .port(8066);

  // plugins
  config
    .plugin("webpackbar")
      .use(Webpackbar, [
        {
          name: "client",
        },
      ])
      .end()
    .plugin("html")
      .use(HtmlWebpackPlugin, [
        {
          template: appHtml,
          title: "React App",
          filename: "index.html",
          ...(isEnvProduction && {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }),
        },
      ])
      .end()
    .plugin("define")
      .use(webpack.DefinePlugin, [
        stringifiedEnv,
      ])
      .end();

  if (isEnvDevelopment) {
    config
      .plugin("react-refresh-webpack-plugin")
        .use(ReactRefreshWebpackPlugin, [
          {
            overlay: false,
          },
        ])
        .end()
      .plugin("case-sensitive-paths-webpack-plugin")
        .use(CaseSensitivePathsPlugin)
        .end();
  }

  if (isEnvProduction) {
    if (!forceInlineStyle) {
      config
        .plugin("mini-css-extract-plugin")
          .use(MiniCssExtractPlugin, [
            {
              filename: "static/css/[name].[contenthash:8].css",
              chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
              // 参考 UMI 4、docusaurus 配置：
              // https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/webpack/base.ts#L244
              // 解决用了 antd 组件库之后，抽提样式冲突问题
              ignoreOrder: true,
            },
          ])
          .end();
    }

    if (IS_CI_ENV && !disableESLintPlugin) {
      // 参考 UMI 4 的方案
      // 开发环境禁用 ESLint 插件（开了会影响构建速度，用编辑器提示就行）
      // 生产环境启用 ESLint 插件（主要用于 CI 检查，可以选择禁用或者将错误转为警告）
      config
        .plugin("eslint-webpack-plugin")
          .use(ESLintPlugin, [
            {
              extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
              formatter: require.resolve('react-dev-utils/eslintFormatter'),
              // 启用多线程提升 CI 构建效率
              threads: true,
              eslintPath: require.resolve('eslint'),
              failOnError: !emitErrorsAsWarnings,
              context: appSrc,
              cache: true,
              cacheLocation: path.resolve(
                appNodeModules,
                '.cache/.eslintcache'
              ),
              // ESLint class options
              cwd: appPath,
              resolvePluginsRelativeTo: __dirname,
              baseConfig: {
                extends: [require.resolve("@study/vita-config-eslint")],
                rules: {
                  ...(!enableNewJsxTransform && {
                    'react/react-in-jsx-scope': 'error',
                  }),
                },
              },
            }
          ]);
    }
  }

  if (useTypeScript) {
    config
      .plugin("fork-ts-checker-webpack-plugin")
        .use(ForkTsCheckerWebpackPlugin, [
          {
            async: isEnvDevelopment,
            typescript: {
              typescriptPath: resolve.sync("typescript", {
                basedir: appNodeModules,
              }),
              configOverwrite: {
                compilerOptions: {
                  sourceMap: shouldUseSourceMap,
                  skipLibCheck: true,
                  inlineSourceMap: false,
                  declarationMap: false,
                  noEmit: true,
                  incremental: true,
                  tsBuildInfoFile: appTsBuildInfoFile,
                },
              },
              context: appPath,
              diagnosticOptions: {
                syntactic: true,
              },
              mode: "write-references",
              // profile: true,
            },
            issue: {
              // This one is specifically to match during CI tests,
              // as micromatch doesn't match
              // '../cra-template-typescript/template/src/App.tsx'
              // otherwise.
              include: [
                { file: "../**/src/**/*.{ts,tsx}" },
                { file: "**/src/**/*.{ts,tsx}" },
              ],
              exclude: [
                { file: "**/src/**/__tests__/**" },
                { file: "**/src/**/?(*.){spec|test}.*" },
                { file: "**/src/setupProxy.*" },
                { file: "**/src/setupTests.*" },
              ],
            },
            logger: "webpack-infrastructure",
          },
        ])
        .end();
  }

  if (analyze) {
    config
      .plugin("analyze")
        .use(BundleAnalyzerPlugin)
        .end();
  }

  // optimization
  config.optimization
    .minimize(isEnvProduction)
    .minimizer("terser")
      .use(TerserPlugin, [
        {
          // 配置参考：
          // https://github.com/facebook/docusaurus/blob/main/packages/docusaurus/src/webpack/utils.ts#L356
          minify: TerserPlugin.terserMinify,
          extractComments: false,
          parallel: true,
          terserOptions: {
            parse: {
              ecma: 2020,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              // 生产环境打包移除 console
              drop_console: true,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        } as any,
      ])
      .end()
    .minimizer("css-minimizer")
      .use(CssMinimizerPlugin)
      .end()
    .runtimeChunk("single")
    .splitChunks({
      // 配置参考：
      // https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack-config.ts#L1556
      // https://github.com/umijs/umi/blob/master/packages/preset-umi/src/features/codeSplitting/codeSplitting.ts

      // 虽然 `chunks: 'all'` 非常强大，但是由于该配置允许在 async chunks 和 non-async chunks 之间共享 chunks
      // 因此 async chunks 抽提出来的公共 chunk 会变成同步加载（内联到 index.html 里面），影响首屏性能
      // 单页应用建议 `chunks: 'async'`，也可以在 `cacheGroups` 里面配置更细粒度的共享策略
      // 多入口打包可以配置 `chunks: 'all'`，可以在多个 initial chunks 共享 chunks
      chunks: "async",
      cacheGroups: {
        ...(codeSplitting && {
          // 针对 React 运行时的缓存组
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "framework",
            chunks: "all",
            priority: 40,
          },
          // 针对 core-js polyfill 的缓存组
          polyfill: {
            test: /[\\/]node_modules[\\/]core-js[\\/]/,
            name: "polyfill",
            chunks: "all",
            priority: 40,
          },
          // 针对 @babel/runtime 的缓存组
          helpers: {
            test: /[\\/]node_modules[\\/]@babel\/runtime[\\/]/,
            name: "helpers",
            chunks: "all",
            priority: 40,
            // @babel/runtime 有可能因为体积过小不分包，这里强制进行分包
            enforce: true,
          },
          // create a new cache group for assets larger than 160kb
          lib: {
            test(module: any) {
              return (
                !isModuleCSS(module) &&
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module: any) {
              const rawRequest =
                module.rawRequest &&
                module.rawRequest.replace(/^@(\w+)[/\\]/, '$1-');
              if (rawRequest) {
                return `${
                  // when `require()` a package with relative path,
                  // need remove leading `.` and `/`, otherwise will not found `.js` file
                  // e.g. require('../../lib/codemirror')
                  rawRequest.replace(/\./g, '_').replace(/\//g, '-')
                }-lib`;
              }

              const identifier = module.identifier();
              const trimmedIdentifier = /(?:^|[/\\])node_modules[/\\](.*)/.exec(
                identifier,
              );
              const processedIdentifier =
                trimmedIdentifier &&
                trimmedIdentifier[1].replace(/^@(\w+)[/\\]/, '$1-');

              return `${processedIdentifier || identifier}-lib`;
            },
            priority: 30,
            // continue to split smaller chunks within this cache group
            minChunks: 1,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          // 针对业务组件库和 antd 的缓存组
          shared: {
            test: /[\\/]node_modules[\\/](@study|antd|@ant-design|rc-.*?)[\\/]/,
            chunks: "all",
            // 让每个依赖拥有单独的文件和 hash
            name: ({ context }: { context: string }) => {
              // e.g. node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es
              const path = context.replace(/.pnpm[\\/]/, "");
              const match = path.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'npm.unknown';
              const packageName = match[1];
              return `npm.${packageName
                .replace(/@/g, '_at_')
                .replace(/\+/g, '_')}`;
            },
          },
        }),
        ...(!cssSplitting && {
          // 将样式抽提到一个单文件中
          // 解决 code-split CSS 加载顺序不同造成样式不一致问题
          // 为啥需要抽提样式，如果 CSS 打入 JS 包里面，会丢失浏览器很多缓存的好处
          // 比如只改了 CSS 代码，导致 JS 内容变化，浏览器会连带 JS 重新加载
          // 实际上对于现在成熟的前端应用来说，缓存不应该在 js/css 这个维度上区分
          // 而是应该按照 组件 来区分，可以将一个组件的 JS、CSS 打入一个包
          // 推荐使用 CSS-in-JS，对 Code-Splitting 和 Tree-Shaking 都比较友好
          styles: {
            name: "styles",
            // necessary to ensure async chunks are also extracted
            test: (m: { type: string }) => {
              return /css\/mini-extract/.test(m.type)
            },
            chunks: "all",
            enforce: true
          },
        }),
      },
    });

  // performance
  // 防止某个 chunk 分包体积超过 250kb 导致 CI 构建报错
  // https://webpack.js.org/configuration/performance/#performancehints
  config
    .performance.hints(false);

  if (chainWebpack) {
    chainWebpack(config, env);
  }

  if (modifyWebpackConfig) {
    config.merge(modifyWebpackConfig);
  }

  return config.toConfig();
}
