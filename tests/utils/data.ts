import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { User, UserCreate } from '../../src/types';
import { SignInProvider } from '../../src/types/enums';
import { issueToken } from '../../src/lib';
import { newUserStore } from '../../src/services';

export const TEST_PASSWORD = '@Password2023';
export const TEST_PASSWORD_CHANGED = '@Password12345';

export const createUser = async (DB: Knex): Promise<{ user: User; data: UserCreate; token: string }> => {
    try {
        const userService = newUserStore({ DB });

        const data: UserCreate = {
            email: faker.internet.email(),
            sign_in_provider: SignInProvider.CUSTOM,
            password: TEST_PASSWORD,
        };

        const user = await userService.create(data);

        const token = issueToken({ id: user.id });

        return { user, data, token };
    } catch (err) {
        console.log(err);
    }
};

export const issueExpiredToken = (): string => {
    // Create the JWT with an expired expiration time
    return jwt.sign({ id: 12345 }, process.env.JWT_SECRET, { expiresIn: '-10s' });
};

export const issueBadToken = (): string => {
    // Create the JWT with an expired expiration time
    return jwt.sign({ id: 12345 }, 'test', { expiresIn: '5s' });
};
