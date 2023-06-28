import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
         CREATE TRIGGER task_after_delete
            AFTER DELETE ON tasks
            FOR EACH ROW
            BEGIN
                INSERT INTO tasks_archive(task_id, title, description, user, category, completed, \`time\`, created_at, updated_at, deleted_at)
                VALUES(OLD.id, OLD.title, OLD.description, OLD.user, OLD.category, OLD.completed, OLD.\`time\`, OLD.created_at, OLD.updated_at, CURRENT_TIMESTAMP);
            END;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TRIGGER IF EXISTS task_after_delete;`);
}
