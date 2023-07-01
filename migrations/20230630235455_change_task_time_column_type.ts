import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE tasks MODIFY COLUMN time VARCHAR(255);`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE tasks MODIFY COLUMN time DATETIME;`);
}
