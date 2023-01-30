import cac, { CAC } from "cac";
import BaseService from "./BaseService";
import { resolveConfig } from "./utils/helpers";

class Service extends BaseService {
  private cli: CAC;

  constructor() {
    super();
    this.cli = cac("vita");
    this.cli.option(
      "-c, --config <file>",
      `[string] use specified config file`,
    );
    this.cli.help();
  }

  public async loadPlugins() {
    const config = await resolveConfig();
    for (const [plugin, options] of Object.entries(config)) {
      try {
        const ResolvedPlugin = this.tryResolvePlugins(plugin);
        if (ResolvedPlugin === null) {
          // 如果为 null，说明插件位于 devDependencies 下，且未安装
          // 这种情况下，无需加载该插件
          continue;
        }
        new ResolvedPlugin().apply(this.cli, options);
      } catch (err) {
        throw err;
      }
    }
  }

  public run() {
    try {
      this.cli.parse();
    } catch (err) {
      throw err;
    }
  }
}

export default Service;
