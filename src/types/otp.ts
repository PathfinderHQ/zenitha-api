import { EmailTypes, OtpType } from './enums';

export interface Otp {
    id: number;
    user: string;
    otp: string;
    expires_at: Date;
    type: OtpType;
    created_at: Date;
}

export interface OtpCreate {
    user: string;
    type: OtpType;
    email: string;
}

export interface OtpFilter {
    id?: number;
    user?: string;
    otp?: string;
    type?: OtpType;
}

export interface OtpService {
    create(data: OtpCreate, type: EmailTypes): Promise<void>;
    get(filter: OtpFilter): Promise<Otp>;
    remove(filter: OtpFilter): Promise<void>;
}
