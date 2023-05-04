import fs from "node:fs/promises";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import prompts from "prompts";
import consola from "consola";

const execa = promisify(exec);

async function main() {
  const { project } = await prompts({
    type: "text",
    name: "project",
    message: "Please provide the <name> of project",
    initial: "new-project",
  });
  let workDir = process.cwd();
  consola.info("[1/2] Cloning the default template...");
  await execa(
    `git clone -b feature/tpl_djc_20230504 --depth=1 https://g.hz.netease.com/ykt-adult-front/kaozheng-miniprogram-servey.git ${project}`,
    { cwd: workDir },
  );
  consola.info("[2/2] Initializing the git repository...");
  workDir = join(workDir, project);
  process.chdir(workDir);
  await fs.unlink(join(workDir, ".git"));
  await execa("git init", { cwd: workDir });
  consola.success("Successfully create the project!");
}

main().catch((err) => {
  consola.error(err);
  process.exit(1);
});
