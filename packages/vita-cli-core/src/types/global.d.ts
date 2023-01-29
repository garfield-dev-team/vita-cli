import { CAC } from "cac";

interface IPlugins {
  apply(cli: CAC): void;
}

export type IConfigSchema = {
  plugins: IPlugins[];
};
