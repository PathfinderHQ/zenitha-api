import { sendgridService } from './sendgrid';
import { EmailClientService, EmailService, SendEmailTemplateParams, SendEmailTextParams } from '../../types';
import { EmailClients } from '../../types/enums';
import logger from '../../config/log';

interface EmailAdapter {
    emailClientService: EmailClientService;
}

// This adapter allows use to use different email clients with one function.
// all we need to do is just specify the email client we want to use
// and of course we have implemented the service.
// as at this commit. We only have SENDGRID, but in the future
// we might cause to use other services such as mailgun, aws ses
// Such case might arise based on the following example
// SENDGRID has poor support to send emails to yahoo servers.
// We might consider using MAILGUN instead for critical emails where delivery
// is of high importance because of their high delivery rate to any server.
export const getEmailAdapter = (emailClient?: EmailClients): EmailAdapter => {
    switch (emailClient) {
        case EmailClients.SENDGRID:
        default:
            return { emailClientService: sendgridService() };
    }
};

export const emailService = (): EmailService => {
    const sendEmailText = async (params: SendEmailTextParams, emailClient?: EmailClients): Promise<void> => {
        const { emailClientService } = getEmailAdapter(emailClient);

        try {
            // send email
            await emailClientService.sendEmailText(params);
        } catch (error) {
            logger.error(error, '[AppEmailService][SendEmailText]');
        }
    };

    const sendEmailTemplate = async (params: SendEmailTemplateParams, emailClient?: EmailClients): Promise<void> => {
        const { emailClientService } = getEmailAdapter(emailClient);

        try {
            // send email
            await emailClientService.sendEmailTemplate(params);
        } catch (error) {
            logger.error(error, '[AppEmailService][SendEmailText]');
        }
    };

    return { sendEmailText, sendEmailTemplate };
};
