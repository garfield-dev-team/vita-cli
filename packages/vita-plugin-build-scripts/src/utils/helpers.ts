import fs from "node:fs";
import path from "node:path";
import { appPath } from "../config/paths";
import { WebpackEnvEnum } from "./constants";

const getEnvFiles = (mode: string) => {
  return [`.env.${mode}`, `.env.local`, `.env`].map((n) =>
    path.resolve(appPath, n),
  );
};

const loadEnvFiles = (dotenvFiles: string[]) => {
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      require("dotenv-expand")(
        require("dotenv").config({
          path: dotenvFile,
        }),
      );
    }
  });
};

export const loadEnvironFromEnvFiles = (mode: string) => {
  const dotenvFiles = getEnvFiles(mode);
  loadEnvFiles(dotenvFiles);
};

const REACT_APP = /^REACT_APP_/i;

export const getClientEnviron = (isEnvDevelopment: boolean) => {
  return {
    "process.env": Object.entries(process.env)
      .filter(([key]) => REACT_APP.test(key))
      .reduce(
        (env, [key, value]) => {
          env[key] = JSON.stringify(value);
          return env;
        },
        {
          NODE_ENV: isEnvDevelopment ? '"development"' : '"production"',
        } as Record<string, string | undefined>,
      ),
  };
};
