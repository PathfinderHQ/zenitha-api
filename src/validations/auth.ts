import Joi, { ObjectSchema } from 'joi';
import { PASSWORD_REGEX } from '../config';

interface AuthPayload {
    email: string;
    password: string;
}

interface GoogleAuthSchema {
    token: string;
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
