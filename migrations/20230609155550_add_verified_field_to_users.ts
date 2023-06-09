import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE users ADD COLUMN verified TINYINT(1) DEFAULT 0;`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE users DROP COLUMN verified;`);
}
