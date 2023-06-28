import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
         CREATE TRIGGER category_after_delete
            AFTER DELETE ON categories
            FOR EACH ROW
            BEGIN
                INSERT INTO categories_archive(category_id, name, user, created_at, updated_at, deleted_at)
                VALUES(OLD.id, OLD.name, OLD.user, OLD.created_at, OLD.updated_at, CURRENT_TIMESTAMP);
            END;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TRIGGER IF EXISTS category_after_delete;`);
}
