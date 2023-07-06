import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE categories ADD COLUMN color VARCHAR(20) DEFAULT '#000000';`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE categories DROP COLUMN color;`);
}
