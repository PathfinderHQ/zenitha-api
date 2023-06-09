import { faker } from '@faker-js/faker';
import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { DB, TEST_PASSWORD, server, createUser, disconnectDatabase, sendgridSuccessResult, createOtp } from '../utils';
import { HttpStatusCode } from '../../src/config';
import firebase from '../../src/lib/firebase';
import { generateOtp, generateRandomString } from '../../src/lib';
import { SignInProvider } from '../../src/types/enums';
import { sgMail } from '../../src/services/email/sendgrid';
import { UserService } from '../../src/types';
import { emailService, newUserStore } from '../../src/services';

jest.mock('../../src/lib/firebase', () => {
    return {
        auth: jest.fn(),
    };
});

describe('Authentication Endpoint', () => {
    let userService: UserService;

    beforeAll(() => {
        const appEmailService = emailService();
        userService = newUserStore({ DB, appEmailService });

        jest.spyOn(sgMail, 'send').mockResolvedValue(sendgridSuccessResult);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

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
                        verified: false,
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

    describe('Google Login', () => {
        it('should register or login with google auth', async () => {
            const email = faker.internet.email();
            const uid = generateRandomString();

            // mock the verifyIdToken method
            (firebase.auth as jest.Mocked<any>).mockReturnValueOnce({
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                verifyIdToken: (token: string) => ({ email, uid } as DecodedIdToken),
            });

            const data = {
                token: generateRandomString(),
            };

            const response = await server().post('/google/auth').send(data);

            expect(response.status).toEqual(HttpStatusCode.OK);
            expect(response.body.data).toMatchObject({
                user: {
                    email,
                    sign_in_provider: SignInProvider.GOOGLE,
                    google_user_id: uid,
                    verified: true,
                },
            });
        });

        it('should return 400 for bad payload', async () => {
            const response = await server().post('/google/auth').send({});

            expect(response.status).toEqual(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('token is required');
        });
    });

    describe('Verify Email', () => {
        it('should verify email', async () => {
            const { otp, user } = await createUser(DB);

            const data = { otp };

            const response = await server().post('/verify_email').send(data);

            expect(response.status).toBe(HttpStatusCode.OK);
            expect(response.body.data).toMatchObject({
                id: user.id,
                verified: true,
            });
        });

        it('should return 400 for bad payload of otp with length not 6', async () => {
            const response = await server().post('/verify_email').send({
                otp: generateRandomString(),
            });

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe(`"otp" length must be 6 characters long`);
        });

        it('should return 400 for invalid otp', async () => {
            const response = await server().post('/verify_email').send({
                otp: generateOtp(),
            });

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Invalid Otp');
        });
    });

    describe('Forgot Password', () => {
        it('should initiate reset password', async () => {
            const { user } = await createUser(DB);

            const data = { email: user.email };

            const response = await server().post('/forgot_password').send(data);

            expect(response.status).toBe(HttpStatusCode.OK);
            expect(response.body.message).toBe('Reset password initiated');
        });

        it('should return 400 for bad payload', async () => {
            const response = await server().post('/forgot_password').send({});

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('email is required');
        });

        it('should return 400 for user not found', async () => {
            const response = await server().post('/forgot_password').send({
                email: faker.internet.email(),
            });

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Invalid email');
        });
    });

    describe('Reset Password', () => {
        it('should reset password', async () => {
            const { otp: payload } = await createOtp(DB);

            const data = {
                otp: payload.otp,
                password: TEST_PASSWORD,
            };

            const response = await server().post('/reset_password').send(data);

            expect(response.status).toBe(HttpStatusCode.OK);
            expect(response.body.message).toBe('Password has been reset');
        });

        it('should return 400 for bad payload', async () => {
            const response = await server().post('/reset_password').send({});

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('otp is required');
        });

        it('should return 400 for invalid otp', async () => {
            const response = await server().post('/reset_password').send({
                otp: generateOtp(),
                password: TEST_PASSWORD,
            });

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Invalid Otp');
        });
    });

    describe('Resend Verify Email', () => {
        it('should resend verify email', async () => {
            const { token } = await createUser(DB);

            const response = await server().post('/user/resend_verify').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(HttpStatusCode.OK);
            expect(response.body.message).toBe('Otp sent');
        });

        it('should return 400 for verified user', async () => {
            // create user
            const { token, user } = await createUser(DB);

            // verify user
            await userService.update({ id: user.id }, { verified: true });

            const response = await server().post('/user/resend_verify').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('User is verified');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
