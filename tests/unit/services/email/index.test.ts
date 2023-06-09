/* eslint-disable @typescript-eslint/no-empty-function */
import { EmailService, SendEmailTemplateParams, SendEmailTextParams } from '../../../../src/types';
import { emailService } from '../../../../src/services';
import { faker } from '@faker-js/faker';
import { sgMail } from '../../../../src/services/email/sendgrid';
import logger from '../../../../src/config/log';
import { EmailTypes } from '../../../../src/types/enums';
import { getEmailAdapter } from '../../../../src/services';
import { sendgridSuccessResult } from '../../../utils';

jest.mock('../../../../src/services', () => {
    const originalModule = jest.requireActual('../../../../src/services');
    return {
        ...originalModule,
        getEmailAdapter: jest.fn(),
    };
});

describe('Email Service', () => {
    let appEmailService: EmailService;

    beforeAll(() => {
        appEmailService = emailService();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Send Text Email', () => {
        const params: SendEmailTextParams = {
            to: faker.internet.email(),
            from: faker.internet.email(),
            subject: faker.word.words(),
            body: faker.word.words(10),
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = jest.spyOn(sgMail, 'send').mockResolvedValue(sendgridSuccessResult);

            await appEmailService.sendEmailText(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            (getEmailAdapter as jest.Mock).mockImplementation(() => {
                throw new Error();
            });

            const logSpy = jest.spyOn(logger, 'error');

            await appEmailService.sendEmailText(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Send Template Email', () => {
        const params: SendEmailTemplateParams = {
            to: faker.internet.email(),
            from: faker.internet.email(),
            subject: faker.word.words(),
            emailType: EmailTypes.VERIFY_EMAIL,
            templateData: { otp: '123456' },
            reply_to: faker.internet.email(),
            send_at: Date.now(),
        };

        it('should send text email', async () => {
            const spy = jest.spyOn(sgMail, 'send').mockResolvedValue(sendgridSuccessResult);

            await appEmailService.sendEmailTemplate(params);

            expect(spy).toHaveBeenCalled();
        });

        it('should log error', async () => {
            (getEmailAdapter as jest.Mock).mockImplementation(() => {
                throw new Error();
            });

            const logSpy = jest.spyOn(logger, 'error');

            await appEmailService.sendEmailTemplate(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });
});
