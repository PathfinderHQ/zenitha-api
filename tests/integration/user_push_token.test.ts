import { HttpStatusCode } from '../../src/config';
import { createUser, DB, disconnectDatabase, server } from '../utils';

describe('User Push Token Routes', () => {
    describe('Create User Push Token', () => {
        it('should create push token', async () => {
            //createUser
            const { token } = await createUser(DB);

            //valid push token
            const data = {
                push_token: 'ExponentPushToken[gldwgqGnGKYXxdFWSM0jBo]',
            };

            const result = await server().post('/user-push-token').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NO_CONTENT);
        });

        it('should return 400 for invalid token', async () => {
            const { token } = await createUser(DB);

            const data = {
                push_token: 'invalid_token',
            };

            const result = await server().post('/user-push-token').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('Push token is invalid');
        });

        it('should return 400 for bad payload', async () => {
            const { token } = await createUser(DB);

            const data = {};

            const result = await server().post('/user-push-token').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('push_token is required');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
