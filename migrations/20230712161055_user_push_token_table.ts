import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(` CREATE TABLE IF NOT EXISTS user_push_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        user CHAR(20) NOT NULL,
        push_token VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_user_pushToken_key
        FOREIGN KEY (user)
        REFERENCES users(id),
        )
       `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS user_push_tokens;`);
}
