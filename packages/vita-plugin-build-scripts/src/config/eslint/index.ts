import rules, { typescript as tsRules } from "./recommended";
import "./setup";

/**
 * 参考 UMI 4 方案
 * 解析器从 @typescript-eslint/parser 换成 @babel/eslint-parser + @babel/preset-typescript 可以节省不少时间
 * 缺点是不支持 type-aware 的 linting 规则（我们通常也不会用他们）
 */
export default {
  parser: require.resolve('@babel/eslint-parser'),
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  rules,
  overrides: [
    {
      parser: require.resolve('@typescript-eslint/parser'),
      plugins: ['@typescript-eslint/eslint-plugin'],
      files: ['**/*.{ts,tsx}'],
      rules: tsRules,
    },
  ],
};
