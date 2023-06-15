import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { Otp, OtpCreate, User, UserCreate } from '../../src/types';
import { EmailTypes, OtpType, SignInProvider } from '../../src/types/enums';
import { issueToken } from '../../src/lib';
import { emailService, newOtpStore, newUserStore } from '../../src/services';

export const TEST_PASSWORD = '@Password2023';
export const TEST_PASSWORD_CHANGED = '@Password12345';

export const createUser = async (
    DB: Knex
): Promise<{
    user: User;
    data: UserCreate;
    token: string;
    otp: string;
}> => {
    try {
        const appEmailService = emailService();
        const userService = newUserStore({ DB, appEmailService });
        const otpService = newOtpStore({ DB, appEmailService });

        const data: UserCreate = {
            email: faker.internet.email(),
            sign_in_provider: SignInProvider.CUSTOM,
            password: TEST_PASSWORD,
        };

        const user = await userService.create(data);

        const foundOtp = await otpService.get({ user: user.id, type: OtpType.VERIFY_EMAIL });

        const token = issueToken({ id: user.id });

        return { user, data, token, otp: foundOtp.otp };
    } catch (err) {
        console.log(err);
    }
};

export const createOtp = async (
    DB: Knex
): Promise<{
    otp: Otp;
    user: User;
    data: OtpCreate;
    token: string;
    emailType: EmailTypes;
}> => {
    try {
        const appEmailService = emailService();
        const otpService = newOtpStore({ DB, appEmailService });

        //  create user
        const { user, token } = await createUser(DB);

        const data: OtpCreate = {
            email: user.email,
            user: user.id,
            type: OtpType.RESET_PASSWORD,
        };

        const emailType = EmailTypes.RESET_PASSWORD;

        // create otp
        await otpService.create(data, emailType);

        // get otp
        const otp = await otpService.get({ user: user.id, type: OtpType.RESET_PASSWORD });

        return { user, data, token, emailType, otp };
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

export const sendgridSuccessResult = [{ statusCode: 200 }, {}] as any;

export const sendgridErrorResult = [{ statusCode: 400 }, {}] as any;
