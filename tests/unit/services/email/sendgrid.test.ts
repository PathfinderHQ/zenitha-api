import { faker } from '@faker-js/faker';
import { EmailClientService, SendEmailTemplateParams, SendEmailTextParams } from '../../../../src/types';
import { getTemplateId, sendgridService, sgMail } from '../../../../src/services/email/sendgrid';
import logger from '../../../../src/config/log';
import { EmailTypes } from '../../../../src/types/enums';

describe('Sendgrid Service', () => {
    let emailClientService: EmailClientService;

    beforeAll(() => {
        emailClientService = sendgridService();
    });

    afterEach(() => {
        jest.clearAllMocks();
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
            jest.spyOn(sgMail, 'send').mockResolvedValue([{ statusCode: 200 }, {}] as any);

            const result = await emailClientService.sendEmailText(params);

            expect(result).toMatchObject({ statusCode: 200 });
        });

        it('should log error', async () => {
            jest.spyOn(sgMail, 'send').mockRejectedValue([{ statusCode: 400 }, {}] as any);

            const logSpy = jest.spyOn(logger, 'error');

            await emailClientService.sendEmailText(params);

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
            jest.spyOn(sgMail, 'send').mockResolvedValue([{ statusCode: 200 }, {}] as any);

            const result = await emailClientService.sendEmailTemplate(params);

            expect(result).toMatchObject({ statusCode: 200 });
        });

        it('should log error', async () => {
            jest.spyOn(sgMail, 'send').mockRejectedValue([{ statusCode: 400 }, {}] as any);

            const logSpy = jest.spyOn(logger, 'error');

            await emailClientService.sendEmailTemplate(params);

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('Get Template ID', () => {
        it('should get the reset password template id', () => {
            const result = getTemplateId(EmailTypes.RESET_PASSWORD);

            expect(result).toBeDefined();
        });

        it('should throw error for unsupported template id', () => {
            expect(() => getTemplateId('test' as EmailTypes)).toThrow('Unknown Email Type');
        });
    });
});
