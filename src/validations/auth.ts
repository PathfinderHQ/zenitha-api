import Joi, { ObjectSchema } from 'joi';
import { PASSWORD_REGEX } from '../config';

interface AuthPayload {
    email: string;
    password: string;
}

interface GoogleAuthSchema {
    token: string;
}

interface ForgotPassword {
    email: string;
}

interface ResetPassword {
    otp: string;
    password: string;
}

interface VerifyEmail {
    otp: string;
}

interface ChangePasswordSchema {
    password: string;
    new_password: string;
}

interface UpdateProfileSchema {
    first_name: string;
    last_name: string;
}

export const registerSchema: ObjectSchema<AuthPayload> = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const googleAuthSchema: ObjectSchema<GoogleAuthSchema> = Joi.object({
    token: Joi.string().required(),
});

export const loginSchema: ObjectSchema<AuthPayload> = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export const forgotPasswordSchema: ObjectSchema<ForgotPassword> = Joi.object({
    email: Joi.string().required(),
});

export const resetPasswordSchema: ObjectSchema<ResetPassword> = Joi.object({
    otp: Joi.string().max(6).required(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const verifyEmailSchema: ObjectSchema<VerifyEmail> = Joi.object({
    otp: Joi.string().length(6).required(),
});

export const changePasswordSchema: ObjectSchema<ChangePasswordSchema> = Joi.object({
    password: Joi.string().required(),
    new_password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const updateProfileSchema: ObjectSchema<UpdateProfileSchema> = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
});
