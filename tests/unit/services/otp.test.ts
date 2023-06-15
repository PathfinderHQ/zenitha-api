import { OtpCreate, OtpService } from '../../../src/types';
import { emailService, newOtpStore } from '../../../src/services';
import { createOtp, createUser, DB, disconnectDatabase, sendgridSuccessResult } from '../../utils';
import { sgMail } from '../../../src/services/email/sendgrid';
import { EmailTypes, OtpType } from '../../../src/types/enums';

describe('Otp Service', () => {
    let otpService: OtpService;

    beforeAll(() => {
        const appEmailService = emailService();
        otpService = newOtpStore({ DB, appEmailService });

        jest.spyOn(sgMail, 'send').mockResolvedValue(sendgridSuccessResult);
    });

    describe('Create', () => {
        it('should create otp', async () => {
            const { user } = await createUser(DB);

            const data: OtpCreate = {
                user: user.id,
                type: OtpType.RESET_PASSWORD,
                email: user.email,
            };

            await otpService.create(data, EmailTypes.RESET_PASSWORD);

            const result = await otpService.get({ user: user.id, type: OtpType.RESET_PASSWORD });

            expect(result).toMatchObject({ user: data.user, type: data.type });
            expect(result.otp).toBeDefined();
        });
    });

    describe('Get', () => {
        it('should get otp', async () => {
            const { otp, data } = await createOtp(DB);

            const result = await otpService.get({
                user: data.user,
                type: data.type,
            });

            expect(result).toMatchObject(otp);
        });
    });

    describe('Remove', () => {
        it('should remove otp', async () => {
            const { otp } = await createOtp(DB);

            // remove the otp from database
            await otpService.remove({ id: otp.id });

            const result = await otpService.get({ id: otp.id });

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
