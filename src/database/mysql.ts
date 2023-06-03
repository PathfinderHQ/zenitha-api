import knex, { Knex } from 'knex';
import Config from '../config';

const { nodeEnv, databaseUser, databasePass, databaseHost, databaseName } = Config;

interface DatabaseAdapterOptions {
    host: string;
    user: string;
    password: string;
    database: string;
    pool?: { min: number; max: number };
}

export const connection: DatabaseAdapterOptions = {
    host: databaseHost,
    user: databaseUser,
    password: databasePass,
    database: databaseName,
};

export function createMysqlAdapter(connection: DatabaseAdapterOptions): Knex {
    const config: Knex.Config = {
        client: 'mysql2',
        connection,
        pool: connection.pool || { min: 3, max: 10 },
        debug: nodeEnv === 'development', // 'local'?
        asyncStackTraces: nodeEnv !== 'production',
        useNullAsDefault: true,
    };

    return knex(config);
}
