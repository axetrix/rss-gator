import fs from "fs";
import os from "os";
// import { fileURLToPath } from "url";
import path from "path";

type ConfigRaw = {
  db_url: string;
  current_user_name: string;
};

type Config = {
  dbUrl: string;
  currentUserName: string;
};

function getConfigFilePath(): string {
  // return path.join(path.dirname(fileURLToPath(import.meta.url)), '../', '.gatorconfig.json');
  return path.join(os.homedir(), '.gatorconfig.json');
}

function tryConfigTransform(config: any): Config {
  if (typeof config !== 'object' || config === null) {
    throw new Error('Invalid config format, expected object');
  }

  const keysCount = Object.keys(config).length;

  if (keysCount > 2) {
    throw new Error('Invalid config format, expected not more than two keys');
  }

  if (typeof config.db_url !== 'string') {
    throw new Error('Invalid config format, db_url expected to be a string');
  }

  if (typeof config.current_user_name !== "string") {
    throw new Error('Invalid config format, current_user_name expected to be a string');
  }

  return {
    dbUrl: config.db_url,
    currentUserName: config.current_user_name
  };
}

function transformConfigToStoreFormat(config: Config): ConfigRaw {
  const { dbUrl, currentUserName } = config;

  return {
    db_url: dbUrl,
    current_user_name: currentUserName
  };
}

function writeConfig(configRaw: ConfigRaw): void {
  const filePath = getConfigFilePath();
  const data = JSON.stringify(configRaw, null, 4);

  fs.writeFileSync(filePath, data, "utf-8");
}

export function readConfig(): Config {
  try {
    const filePath = getConfigFilePath();
    const data = fs.readFileSync(filePath, "utf-8");

    const configRaw = JSON.parse(data);

    return tryConfigTransform(configRaw);
  } catch (error) {
    console.error('Error reading config file:', error);

    throw error;
  }
}

export function setUser(user: string): Config {
  try {
    const config = readConfig();

    config.currentUserName = user;

    writeConfig(transformConfigToStoreFormat(config));

    return config;
  } catch (error) {
    console.error('Error setting user:', error);

    throw error;
  }
}
