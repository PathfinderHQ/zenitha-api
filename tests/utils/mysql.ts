import { createMysqlAdapter } from '../../src/database';

export const DB = createMysqlAdapter({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
});

export const disconnectDatabase = async () => {
    await DB.destroy();
};
