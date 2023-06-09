import 'dotenv/config';

export enum NODE_ENV {
    DEVELOPMENT = 'development',
    PRODUCT = 'production',
    TEST = 'test',
}

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
    firebase: {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
        universe_domain: string;
    };
    sendgridApiKey: string;
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
        nodeEnv: (process.env.NODE_ENV as NODE_ENV) || NODE_ENV.DEVELOPMENT,
        databaseName: process.env.DATABASE_NAME,
        databaseHost: process.env.DATABASE_HOST,
        databasePass: process.env.DATABASE_PASS,
        databaseUser: process.env.DATABASE_USER,
        jwtSecret: process.env.JWT_SECRET || '2 days',
        jwtExpiry: process.env.JWT_EXPIRY || 'woohoo',
        logUrl: process.env.LOG_URL || '',
        firebase: {
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
            universe_domain: process.env.UNIVERSE_DOMAIN,
        },
        sendgridApiKey: process.env.SENDGRID_API_KEY,
    };
};

export default getConfig();
