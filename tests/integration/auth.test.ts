import { faker } from '@faker-js/faker';
import { DB, TEST_PASSWORD, server, createUser, disconnectDatabase } from '../utils';
import { HttpStatusCode } from '../../src/config';

describe('Authentication Endpoint', () => {
    describe('Register', () => {
        it('should register successfully', async () => {
            const data = {
                email: faker.internet.email(),
                password: '@Password12',
            };

            const response = await server().post('/register').send(data);

            expect(response.status).toEqual(HttpStatusCode.CREATED);
            expect(response.body).toMatchObject({
                data: {
                    user: {
                        email: data.email,
                    },
                },
            });
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('expiry');
        });

        it('should return 400 for bad payload', async () => {
            const data = {
                email: faker.internet.email(),
            };

            const response = await server().post('/register').send(data);

            expect(response.status).toEqual(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('password is required');
        });

        it('should return 400 for existing account', async () => {
            const { user } = await createUser(DB);

            const data = {
                email: user.email,
                password: '@Password12',
            };

            const response = await server().post('/register').send(data);

            expect(response.status).toEqual(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('User already exists');
        });
    });

    describe('Login', () => {
        it('should login successfully', async () => {
            const { user, data } = await createUser(DB);

            const payload = {
                email: data.email,
                password: TEST_PASSWORD,
            };

            const response = await server().post('/login').send(payload);

            expect(response.status).toBe(HttpStatusCode.OK);
            expect(response.body.data).toMatchObject({
                user: {
                    email: user.email,
                },
            });
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail for invalid email', async () => {
            const payload = {
                email: faker.internet.email(),
                password: TEST_PASSWORD,
            };

            const response = await server().post('/login').send(payload);

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Invalid email/password');
        });

        it('should fail for incorrect password', async () => {
            const { data } = await createUser(DB);

            const payload = {
                email: data.email,
                password: 'wrongpassword',
            };

            const response = await server().post('/login').send(payload);

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Invalid email/password');
        });
    });

    describe('Get', () => {
        it('should get user', async () => {
            const { token, user } = await createUser(DB);

            const response = await server().get('/user').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.OK);
            expect(response.body).toMatchObject({
                data: {
                    email: user.email,
                },
            });
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
