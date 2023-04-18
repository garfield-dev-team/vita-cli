import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Compiler } from "webpack";

type IOpts = {
  title: string;
};

type IBuildAssets = {
  js: string[];
  css: string[];
};

class ExtractAssetsPlugin {
  private options: IOpts;

  constructor(options: IOpts) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { path, publicPath = "" } = compiler.options.output;
    const assets: IBuildAssets = {
      js: [],
      css: [],
    };
    compiler.hooks.done.tapPromise(
      "ExtractAssetsPlugin",
      async ({ compilation }) => {
        compilation.entrypoints.forEach((entry, name) => {
          const files = entry.getFiles();
          files
            .map((file) => {
              const filename = file.replace(/\.(css|js)\?.*$/, ".$1");
              return join(publicPath as string, filename);
            })
            .forEach((file) => {
              if (/\.(js)$/.test(file)) {
                assets.js.push(file);
              } else if (/\.(css)$/.test(file)) {
                assets.css.push(file);
              }
            });
        });
        await writeFile(
          JSON.stringify(
            { ...assets, title: this.options.title, output: path },
            null,
            4,
          ),
          path as string,
        );
      },
    );
  }
}

export { ExtractAssetsPlugin };
