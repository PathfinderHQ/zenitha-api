import type { Knex } from 'knex';
import 'dotenv/config';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: {
            database: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: __dirname + '/migrations',
        },
        seeds: {
            directory: __dirname + '/seeds',
        },
    },
    test: {
        client: 'mysql2',
        connection: {
            database: 'zenithatesting',
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
        },
        migrations: {
            directory: __dirname + '/migrations',
        },
        pool: {
            min: 2,
            max: 10,
        },
        seeds: {
            directory: __dirname + '/seeds',
        },
    },
    production: {
        client: 'mysql2',
        connection: {
            database: process.env.DATABASE_NAME,
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
        },
        migrations: {
            directory: __dirname + '/migrations',
        },
        seeds: {
            directory: __dirname + '/seeds',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
};

module.exports = config;
