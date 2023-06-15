import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER AUTO_INCREMENT PRIMARY KEY,
            user CHAR(20) NOT NULL,
            otp CHAR(6) NOT NULL,
            type CHAR(20) NOT NULL,
            expires_at DATETIME DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_user_otp_key
                FOREIGN KEY (user)
                    REFERENCES users(id)
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE otps DROP FOREIGN KEY fk_user_otp_key;`);
    await knex.raw(`DROP TABLE IF EXISTS otps;`);
}
