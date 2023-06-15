import { faker } from '@faker-js/faker';
import { emailService, newOtpStore, newUserStore } from '../../../src/services';
import { EmailService, OtpService, UserCreate, UserService } from '../../../src/types';
import { createUser, DB, disconnectDatabase, sendgridSuccessResult } from '../../utils';
import { OtpType, SignInProvider } from '../../../src/types/enums';
import { generateId, generateRandomString } from '../../../src/lib';
import { sgMail } from '../../../src/services/email/sendgrid';

describe('User Service', () => {
    let userService: UserService;
    let appEmailService: EmailService;
    let otpService: OtpService;

    beforeAll(() => {
        appEmailService = emailService();
        userService = newUserStore({ DB, appEmailService });
        otpService = newOtpStore({ DB, appEmailService });

        jest.spyOn(sgMail, 'send').mockResolvedValue(sendgridSuccessResult);
    });

    describe('Create User', () => {
        it('should create user', async () => {
            const data: UserCreate = {
                email: faker.internet.email(),
                sign_in_provider: SignInProvider.CUSTOM,
                password: '@Password2023',
                verified: false,
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

        it('should create otp', async () => {
            const data: UserCreate = {
                email: faker.internet.email(),
                sign_in_provider: SignInProvider.CUSTOM,
                password: '@Password2023',
            };

            const user = await userService.create(data);

            const result = await otpService.get({ user: user.id, type: OtpType.VERIFY_EMAIL });

            expect(result).toMatchObject({ user: user.id, type: OtpType.VERIFY_EMAIL });
            expect(result.otp).toBeDefined();
        });

        it('should send email', async () => {
            const data: UserCreate = {
                email: faker.internet.email(),
                sign_in_provider: SignInProvider.CUSTOM,
                password: '@Password2023',
            };

            await userService.create(data);

            const emailSpy = jest.spyOn(sgMail, 'send');

            expect(emailSpy).toHaveBeenCalled();
        });
    });

    describe('Get User', () => {
        it('should get a user', async () => {
            const { user } = await createUser(DB);

            const result = await userService.get({
                id: user.id,
                verified: false,
                sign_in_provider: SignInProvider.CUSTOM,
            });

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
