import { faker } from '@faker-js/faker';
import { newUserStore } from '../../../src/services';
import { UserCreate, UserService } from '../../../src/types';
import { createUser, DB, disconnectDatabase } from '../../utils';
import { SignInProvider } from '../../../src/types/enums';
import { generateId, generateRandomString } from '../../../src/lib';

describe('User Service', () => {
    let userService: UserService;

    beforeAll(() => {
        userService = newUserStore({ DB });
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const data: UserCreate = {
                email: faker.internet.email(),
                sign_in_provider: SignInProvider.CUSTOM,
                password: '@Password2023',
            };

            const result = await userService.create(data);

            expect(result.id).toBeDefined();
            expect(result.created_at).toBeDefined();
            expect(result.updated_at).toBeDefined();
            expect(result).toMatchObject(data);
        });

        it('should hash password', async () => {
            const data: UserCreate = {
                email: faker.internet.email(),
                sign_in_provider: SignInProvider.CUSTOM,
                password: '@Password2023',
            };

            const result = await userService.create(data);

            expect(result.password).toEqual(expect.not.stringMatching(data.password));
        });
    });

    describe('Get User', () => {
        it('should get a user', async () => {
            const { user } = await createUser(DB);

            const result = await userService.get({ id: user.id });

            expect(result).toMatchObject(user);
        });

        it('should not return a user', async () => {
            const id = generateId();

            const result = await userService.get({ id });

            expect(result).toBeUndefined();
        });
    });

    describe('List Users', () => {
        it('should list users', async () => {
            const { user } = await createUser(DB);

            const result = await userService.list({ email: user.email });

            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        it('should not return a user', async () => {
            const id = generateId();

            const result = await userService.list({ id });

            expect(result.length).toEqual(0);
        });
    });

    describe('Update User', () => {
        it('should update user', async () => {
            const { user } = await createUser(DB);

            const updateData = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
            };

            const result = await userService.update({ email: user.email }, updateData);

            expect(result).toMatchObject(updateData);
        });

        it('should change hash password on update', async () => {
            const { user } = await createUser(DB);

            const updateData = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                password: generateRandomString(),
            };

            const result = await userService.update({ id: user.id }, updateData);

            expect(result.password).toEqual(expect.not.stringMatching(user.password));
        });

        it('should not make any update on empty data', async () => {
            const { user } = await createUser(DB);

            const result = await userService.update({ id: user.id }, {});

            expect(result).toMatchObject(user);
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
