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

export async function configFactory({
  env,
  analyze = false,
  codeSplitting = true,
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
  config.stats("errors-warnings");
  config.infrastructureLogging({ level: "error" });

  // entry
  config.entry("main").add(appIndexJs);

  // devtool
  config.devtool(shouldUseSourceMap ? "eval-cheap-module-source-map" : false);

  // output
  config.output
    .path(appBuild)
    .filename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].js",
    )
    .chunkFilename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js",
    )
    // .assetModuleFilenamet("static/media/[name].[hash][ext]")
    .publicPath(process.env.PUBLIC_URL || "auto")
    .set("assetModuleFilename", "static/media/[name].[hash][ext]")
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
              require.resolve("./babel"),
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
    .issuer({
      and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
    })
    .use("@svgr/webpack")
      .loader(require.resolve("@svgr/webpack"))
      .options({
        prettier: false,
        svgo: false,
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
        titleProp: true,
        ref: true,
      })
      .end()
    .use("file-loader")
      .loader(require.resolve("file-loader"))
      .options({
        name: "static/media/[name].[hash].[ext]",
      })
      .end()
    .end();

  config.module
    .rule("font")
    .test(/\.(woff|woff2|ttf|eot|svg)$/)
    .exclude
      .add(/node_modules/)
      .end()
    .type("asset")
    .end();

  config.module
    .rule("image")
    .test(/\.(png|jpg|gif|jpeg|ico|cur)$/)
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
    .historyApiFallback(true)
    .host("0.0.0.0")
    .port(8066);

  // plugins
  config
    .plugin("webpackbar")
      .use(Webpackbar)
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
                extends: [require.resolve("./eslint")],
                parserOptions: {
                  ecmaFeatures: {
                    jsx: true,
                  },
                  babelOptions: {
                    babelrc: false,
                    configFile: false,
                    browserslistConfigFile: false,
                    presets: [
                      [
                        require.resolve("./babel"),
                        babelConfigContext,
                      ]
                    ],
                  },
                  requireConfigFile: false,
                },
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
            logger: {
              infrastructure: "silent",
            },
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
          minify: TerserPlugin.terserMinify,
          extractComments: false,
          terserOptions: {
            parse: {
              ecma: 8,
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
      chunks: "all",
      ...(codeSplitting && {
          cacheGroups: {
          // 针对业务组件库的缓存组
          commons: {
            test: /[\\/]node_modules[\\/]@study[\\/]/,
            name: "commons",
            chunks: "all",
          },
          // 针对 antd 的缓存组
          vendor: {
            test: /[\\/]node_modules[\\/](antd|@ant-design|rc-.*?)[\\/]/,
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
          // Extracting all CSS/less in a single file
          // styles: {
          //   name: 'styles',
          //   test: /\.(c|le)ss$/,
          //   chunks: 'all',
          //   enforce: true,
          // },
        },
      })
    });

  if (chainWebpack) {
    chainWebpack(config, env);
  }

  if (modifyWebpackConfig) {
    config.merge(modifyWebpackConfig);
  }

  return config.toConfig();
}
