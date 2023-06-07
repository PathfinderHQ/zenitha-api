import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(20) PRIMARY KEY NOT NULL,
            first_name VARCHAR(255) NULL,
            last_name VARCHAR(255) NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NULL,
            sign_in_provider CHAR(10) NOT NULL,
            google_access_token VARCHAR(255) NULL,
            google_user_id VARCHAR(255) NULL,
            microsoft_access_token VARCHAR(255) NULL,
            microsoft_user_id VARCHAR(255) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS users;`);
}
