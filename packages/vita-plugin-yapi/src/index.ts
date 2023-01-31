import type { CAC } from "cac";
import type { IConfig } from "./types/global";

class YapiPlugin {
  apply(cli: CAC, options: IConfig) {
    cli
      .command("gen", "generate .d.ts definition and api request function")
      .option("--dts", `[boolean] generate .d.ts definition only`)
      .option("--dry", `[boolean] no emit files`)
      .action(async ({ dts, dry }: { dts?: boolean; dry?: boolean }) => {
        const module = await import("../src/scripts/core");
        await module.generate({ ...options, dts, dry });
      });
  }
}

export type { IConfig };

export default YapiPlugin;
