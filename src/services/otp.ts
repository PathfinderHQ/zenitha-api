import { Knex } from 'knex';
import { EmailService, Otp, OtpCreate, OtpFilter, OtpService } from '../types';
import { OTPS } from '../database';
import { generateOtp } from '../lib';
import { EmailTypes } from '../types/enums';
import { ZENITHA_NO_REPLY } from '../config';

export interface OtpStore {
    DB: Knex;
    appEmailService: EmailService;
}

export const newOtpStore = (os: OtpStore): OtpService => {
    const create = async (data: OtpCreate, emailType: EmailTypes): Promise<void> => {
        const { email, user, type } = data;
        const otp = generateOtp();
        await os.DB(OTPS).insert({ otp, user, type });

        // we won't await it, same reason as in `create` in `src/services/user.ts`
        os.appEmailService.sendEmailTemplate({
            from: ZENITHA_NO_REPLY,
            to: email,
            emailType,
            templateData: { otp },
        });
    };

    const get = async (filter: OtpFilter): Promise<Otp> => {
        return os.DB(OTPS).where('expires_at', '>', os.DB.raw('NOW()')).andWhere(filter).first();
    };

    const remove = async (filter: OtpFilter): Promise<void> => {
        await os.DB(OTPS).where(filter).del();
    };

    return { create, get, remove };
};
