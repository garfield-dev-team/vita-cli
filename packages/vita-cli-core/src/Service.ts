import cac, { CAC } from "cac";
import { resolveConfig } from "./utils/helpers";

class Service {
  private cli: CAC;

  constructor() {
    this.cli = cac("vita");
    this.cli.option(
      "-c, --config <file>",
      `[string] use specified config file`,
    );
    this.cli.help();
  }

  public async loadPlugins() {
    const config = await resolveConfig();
    console.log("===", config);
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
