import 'dotenv/config';

type NODE_ENV = 'development' | 'production' | 'test';

export const BCRYPT_SALT = 10;
export const PASSWORD_REGEX = '^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\\d]){1,})(?=(.*[\\W]){1,})(?!.*\\s).{8,}$';

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

export interface Config {
    port: number;
    nodeEnv: NODE_ENV;
    databaseName: string;
    databaseUser: string;
    databasePass: string;
    databaseHost: string;
    jwtSecret: string;
    jwtExpiry: string;
    logUrl: string;
}

export const getConfig = (): Config => {
    const required: string[] = ['NODE_ENV', 'DATABASE_NAME', 'DATABASE_HOST', 'DATABASE_PASS', 'DATABASE_USER'];

    if (!process.env.CI) {
        // Do not require this check in CI
        required.forEach((variable) => {
            if (!process.env[variable]) throw new Error(`${variable} env not set`);
        });
    }

    return {
        port: Number(process.env.PORT) || 8000,
        nodeEnv: (process.env.NODE_ENV as NODE_ENV) || 'development',
        databaseName: process.env.DATABASE_NAME,
        databaseHost: process.env.DATABASE_HOST,
        databasePass: process.env.DATABASE_PASS,
        databaseUser: process.env.DATABASE_USER,
        jwtSecret: process.env.JWT_SECRET || '2 days',
        jwtExpiry: process.env.JWT_EXPIRY || 'woohoo',
        logUrl: process.env.LOG_URL || '',
    };
};

export default getConfig();
