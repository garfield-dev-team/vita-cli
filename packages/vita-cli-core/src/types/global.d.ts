import { CAC } from "cac";

export type IPackageJson = {
  dependencies: Record<string, string>;
} | null;

class IVitaPlugins {
  apply(cli: CAC, options: any): void;
}

export type IResolvedPlugins = typeof IVitaPlugins | null;
