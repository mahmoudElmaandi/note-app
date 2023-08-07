import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, "../../.env") });

interface ENV {
    PORT: number | undefined;
    JWT_SECRET: string | undefined;
    PASSWORD_SALT: string | undefined;
}

interface Config {
    PORT: number;
    JWT_SECRET: string,
    PASSWORD_SALT: string;
}

const getConfig = (): ENV => {
    return {
        PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
        JWT_SECRET: process.env.JWT_SECRET,
        PASSWORD_SALT: process.env.PASSWORD_SALT
    };
};

const getSanitzedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;