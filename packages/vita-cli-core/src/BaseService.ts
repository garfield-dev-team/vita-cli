import fs from "node:fs";
import path from "node:path";
import { IPackageJson, IResolvedPlugins } from "./types/global";
import { CONFIG_KEY_MAP } from "./utils/constants";
import { configRoot } from "./utils/helpers";

class BaseService {
  private pkg: IPackageJson = null;

  public tryResolvePlugins(key: string): IResolvedPlugins {
    const dependencies = this.getDependencies();
    if (!Object.keys(CONFIG_KEY_MAP).includes(key)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    const packageName = CONFIG_KEY_MAP[key as keyof typeof CONFIG_KEY_MAP];

    const filePath = path.resolve(configRoot, `node_modules/${packageName}`);
    if (fs.existsSync(filePath)) {
      const module = require(filePath);
      return module.default || module;
    }
    if (Object.keys(dependencies).includes(packageName)) {
      throw new Error(
        `Plugin ${packageName} specified in dependencies not found`,
      );
    }
    return null;
  }

  private getDependencies() {
    if (this.pkg) {
      return this.pkg.dependencies;
    }
    const filePath = path.resolve(configRoot, "package.json");
    try {
      this.pkg = require(filePath);
      return this.pkg!.dependencies;
    } catch (error) {
      throw new Error("No package.json found");
    }
  }
}

export default BaseService;
