import knex, { Knex } from 'knex';
import { Field } from 'mysql2';
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
        connection: {
            ...connection,
            typeCast: function (field: Field, next: () => void) {
                // convert tiny fields to boolean
                if (field.type === 'TINY' && field.length === 1) {
                    return field.string() === '1'; // 1 = true, 0 = false
                }

                return next();
            },
        },
        pool: connection.pool || { min: 3, max: 10 },
        debug: nodeEnv === 'development', // 'local'?
        asyncStackTraces: nodeEnv !== 'production',
        useNullAsDefault: true,
    };

    return knex(config);
}
