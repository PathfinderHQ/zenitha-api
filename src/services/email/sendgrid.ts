import sgMail from '@sendgrid/mail';
import { EmailClientService, EmailResponse, SendEmailTemplateParams, SendEmailTextParams } from '../../types';
import Config from '../../config';
import logger from '../../config/log';
import { EmailTypes } from '../../types/enums';

sgMail.setApiKey(Config.sendgridApiKey);

// The template ids here are gotten from the sendgrid dashboard
// Added HTML Templates on the dashboard already
// this save us from writing HTML templates here
export const getTemplateId = (type: EmailTypes) => {
    switch (type) {
        case EmailTypes.VERIFY_EMAIL:
            return 'd-998f1bcdcc004d7eb17e8c57b5a08f01';
        case EmailTypes.RESET_PASSWORD:
            return 'd-d98bb74a9ea64850a069065c5d873fd5';
        default:
            throw new Error('Unknown Email Type');
    }
};

export const sendgridService = (): EmailClientService => {
    // send email by providing default html
    const sendEmailText = async (params: SendEmailTextParams): Promise<EmailResponse> => {
        try {
            const msg = {
                to: params.to,
                from: params.from,
                subject: params.subject,
                html: params.body,
                replyTo: params.reply_to,
                sendAt: params.send_at,
            };

            // send email
            const [response] = await sgMail.send(msg);

            return { statusCode: response.statusCode };
        } catch (error) {
            logger.error(error, '[SendgridService][SendEmailText]');
        }
    };

    // send email using templates added already on the dashboard
    const sendEmailTemplate = async (params: SendEmailTemplateParams): Promise<EmailResponse> => {
        try {
            const templateId = getTemplateId(params.emailType);

            const msg = {
                to: params.to,
                subject: params.subject,
                from: params.from,
                templateId: `${templateId}`,
                dynamicTemplateData: params.templateData,
                sendAt: params.send_at,
            };

            const [response] = await sgMail.send(msg);

            return { statusCode: response.statusCode };
        } catch (error) {
            logger.error(error, '[SendgridService][SendEmailTemplate]');
        }
    };

    return { sendEmailText, sendEmailTemplate };
};

// exporting it solely for testing purposes
export { sgMail };
