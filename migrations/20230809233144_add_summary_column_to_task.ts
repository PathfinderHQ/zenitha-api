import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE tasks ADD COLUMN summary VARCHAR(255) DEFAULT 'You have a pending task';`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE tasks DROP COLUMN summary;`);
}
