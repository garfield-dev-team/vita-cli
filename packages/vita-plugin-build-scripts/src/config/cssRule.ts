import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { IConfigCtx } from "./webpack.config";
import { WebpackEnvEnum } from "../utils/constants";

type IConfig = {
  name: string;
  test: RegExp;
  exclude?: RegExp;
  importLoaders: number;
  isCSSModules: boolean;
  loader?: string;
  loaderOptions?: {};
};

const createRuleConfig = ({ theme }: IConfigCtx): IConfig[] => ([
  {
    name: "css",
    test: /\.css$/i,
    exclude: /\.module\.css$/,
    importLoaders: 1,
    isCSSModules: false,
  },
  {
    name: "cssModule",
    test: /\.module\.css$/,
    importLoaders: 1,
    isCSSModules: true,
  },
  {
    name: "less",
    test: /\.less$/i,
    exclude: /\.module\.less$/,
    importLoaders: 2,
    isCSSModules: false,
    loader: "less-loader",
    loaderOptions: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: theme,
      },
    }
  },
  {
    name: "lessModule",
    test: /\.module\.less$/,
    importLoaders: 2,
    isCSSModules: true,
    loader: "less-loader",
    loaderOptions: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: theme,
      },
    }
  },
  {
    name: "sass",
    test: /\.(sass|scss)$/i,
    exclude: /\.module\.(scss|sass)$/,
    importLoaders: 2,
    isCSSModules: false,
    loader: "sass-loader",
    loaderOptions: {},
  },
  {
    name: "sassModule",
    test: /\.module\.(scss|sass)$/,
    importLoaders: 2,
    isCSSModules: true,
    loader: "sass-loader",
    loaderOptions: {},
  },
]);

const createBaseRule = (
  { env, config, forceInlineStyle, shouldUseSourceMap }: IConfigCtx,
  { name, test, exclude, importLoaders, isCSSModules }: IConfig
) => {
  const isEnvDevelopment = env === WebpackEnvEnum.DEVELOPMENT;
  const rule = config.module.rule(name).test(test);
  if (exclude) {
    rule
      .exclude
        .add(exclude)
        .end();
  }

  if (!isCSSModules) {
    rule.sideEffects(true);
  }

  if (isEnvDevelopment || forceInlineStyle) {
    rule
      .use("style-loader")
        .loader(require.resolve("style-loader"))
        .end();
  } else {
    rule
      .use("mini-css-extract-plugin")
        .loader(MiniCssExtractPlugin.loader)
        .end();
  }

  rule
    .use("css-loader")
      .loader(require.resolve("css-loader"))
      .options({
        sourceMap: shouldUseSourceMap,
        importLoaders,
        modules: {
          ...(!isCSSModules ? { mode: 'icss' } : {
            mode: 'local',
            localIdentName: '[local]___[hash:base64:5]',
          })
        },
      })
      .end()
    .use("postcss-loader")
      .loader(require.resolve("postcss-loader"))
      .options({
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          plugins: [
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              },
            ],
            // 不需要 postcss 提供的 CSS Reset 选项
            // 一般组件库例如 Antd 都会内置 CSS Reset
            // 'postcss-normalize',
          ],
        },
        sourceMap: shouldUseSourceMap,
      })
      .end();

  return rule;
}

export const addCSSRules = (ctx: IConfigCtx) => {
  const ruleConfig = createRuleConfig(ctx);

  ruleConfig.forEach((cssRule) => {
    const rule = createBaseRule(ctx, cssRule);
    if (cssRule.loader) {
      rule
        .use(cssRule.loader)
          .loader(require.resolve(cssRule.loader))
          .options(cssRule.loaderOptions as {})
          .end();
    }
  })
}
