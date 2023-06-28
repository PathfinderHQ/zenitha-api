import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS tasks_archive (
            task_id CHAR(20) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NULL,
            user CHAR(20) NULL,
            category CHAR(20) NULL,
            completed TINYINT(1) DEFAULT 0,
            \`time\` DATETIME NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NULL,
            deleted_at DATETIME NOT NULL
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS tasks_archive;`);
}
