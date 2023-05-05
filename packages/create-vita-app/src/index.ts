import fs from "node:fs/promises";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import prompts from "prompts";
import consola from "consola";

const execa = promisify(exec);

const questions = [
  {
    type: "text",
    name: "project",
    message: "Please provide the <name> of project",
    initial: "new-project",
  },
  {
    type: "select",
    name: "packageManager",
    message: "Please select the <package manager>",
    choices: [
      { title: "pnpm", value: "pnpm" },
      { title: "yarn", value: "yarn" },
      { title: "npm", value: "npm" },
    ],
  },
  {
    type: "toggle",
    name: "useTypeScript",
    message: "Does this project use TypeScript",
    initial: true,
    active: "yes",
    inactive: "no",
  },
  {
    type: "confirm",
    name: "deps",
    message: "Should we install the dependencies",
    initial: true,
  },
  {
    type: "confirm",
    name: "git",
    message: "Should we initialize the git repository",
    initial: true,
  },
] as Array<prompts.PromptObject>;

async function main() {
  const { project } = await prompts(questions);
  let workDir = process.cwd();
  consola.info("[1/3] Cloning the default template...");
  await execa(
    `git clone -b feature/tpl_djc_20230504 --depth=1 https://g.hz.netease.com/ykt-adult-front/kaozheng-miniprogram-servey.git ${project}`,
    { cwd: workDir },
  );
  workDir = join(workDir, project);
  process.chdir(workDir);
  await fs.rm(join(workDir, ".git"), { recursive: true });
  consola.info("[2/3] Installing dependencies...");
  await execa("pnpm install", { cwd: workDir });
  consola.info("[3/3] Initializing the git repository...");
  await execa("git init", { cwd: workDir });
  consola.success("Successfully create the project!");
}

main().catch((err) => {
  consola.error(err);
  process.exit(1);
});
