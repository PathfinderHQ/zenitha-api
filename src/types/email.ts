import { EmailClients, EmailTypes } from './enums';

export interface SendEmailTextParams {
    to: string | string[];
    from: string | { name?: string; email: string };
    subject: string;
    body: string;
    reply_to?: string | { name?: string; email: string };
    send_at?: number;
}

export interface SendEmailTemplateParams {
    to: string | string[];
    from: string;
    subject?: string;
    emailType: EmailTypes;
    templateData: TemplateData;
    reply_to?: string | { name?: string; email: string };
    send_at?: number;
}

export interface EmailResponse {
    statusCode: number;
}

export interface EmailService {
    sendEmailText(params: SendEmailTextParams, emailClient?: EmailClients): Promise<void>;
    sendEmailTemplate(params: SendEmailTemplateParams, emailClient?: EmailClients): Promise<void>;
}

export interface EmailClientService {
    sendEmailText(params: SendEmailTextParams, emailClient?: EmailClients): Promise<EmailResponse>;
    sendEmailTemplate(params: SendEmailTemplateParams, emailClient?: EmailClients): Promise<EmailResponse>;
}

export interface VerifyEmailTemplateData {
    otp: string;
}

export interface ResetPasswordEmailTemplateData {
    otp: string;
}

type TemplateData = VerifyEmailTemplateData | ResetPasswordEmailTemplateData;
