import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS categories (
            id CHAR(20) NOT NULL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            user CHAR(20) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_user_category_key
            FOREIGN KEY (user)
            REFERENCES users(id)
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE categories DROP FOREIGN KEY fk_user_category_key;`);
    await knex.raw(`DROP TABLE IF EXISTS categories;`);
}
