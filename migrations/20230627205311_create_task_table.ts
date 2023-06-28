import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS tasks (
            id CHAR(20) NOT NULL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NULL,
            user CHAR(20) NULL,
            category CHAR(20) NULL,
            completed TINYINT(1) DEFAULT 0,
            \`time\` DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_user_task_key
            FOREIGN KEY (user)
            REFERENCES users(id),
            
            CONSTRAINT fk_category_task_key
            FOREIGN KEY (category)
            REFERENCES categories(id)
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE tasks
            DROP FOREIGN KEY fk_user_task_key,
            DROP FOREIGN KEY fk_category_task_key;
    `);
    await knex.raw(`DROP TABLE IF EXISTS tasks;`);
}
