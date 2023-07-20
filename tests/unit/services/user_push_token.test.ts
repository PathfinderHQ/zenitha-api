import { newUserPushTokenStore } from '../../../src/services';
import { UserPushTokenService } from '../../../src/types';
import { createUser, createUserPushToken, DB, disconnectDatabase } from '../../utils';
import { generateRandomString } from '../../../src/lib';

describe('UserPushTokenService', () => {
    let userPushTokenService: UserPushTokenService;
    function generateExponentPushToken() {
        const randomString = generateRandomString({ length: 22 });
        return `ExponentPushToken[${randomString}]`;
    }

    beforeAll(() => {
        userPushTokenService = newUserPushTokenStore({ DB });
    });

    describe('Create UserPushToken', () => {
        it('should create UserPushToken', async () => {
            const { user } = await createUser(DB);
            const data = {
                user: user.id,
                push_token: generateExponentPushToken(),
            };

            await userPushTokenService.create(data);
            const result = await userPushTokenService.get({ user: data.user, push_token: data.push_token });

            expect(result).toMatchObject(data);
        });
    });

    describe('Get UserPushToken', () => {
        it('should get a UserPushToken', async () => {
            const { data } = await createUserPushToken(DB);

            const result = await userPushTokenService.get(data);

            expect(result).toMatchObject({
                user: data.user,
                push_token: data.push_token,
            });
        });
    });

    describe('List UserPushTokens', () => {
        it('should list UserPushTokens', async () => {
            const { data } = await createUserPushToken(DB);
            const result = await userPushTokenService.list({
                user: data.user,
                push_token: data.push_token,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        user: data.user,
                        push_token: data.push_token,
                    }),
                ])
            );
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
