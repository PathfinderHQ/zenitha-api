import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE users
            DROP COLUMN google_access_token,
            DROP COLUMN microsoft_access_token,
            DROP COLUMN microsoft_user_id;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE users
            ADD COLUMN google_access_token VARCHAR(255) NULL,
            ADD COLUMN microsoft_access_token VARCHAR(255) NULL,
            ADD COLUMN microsoft_user_id VARCHAR(255) NULL;
    `);
}
