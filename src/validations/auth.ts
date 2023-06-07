import Joi, { ObjectSchema } from 'joi';
import { PASSWORD_REGEX } from '../config';

export interface AuthPayload {
    email: string;
    password: string;
}

export const registerSchema: ObjectSchema<AuthPayload> = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
});

export const loginSchema: ObjectSchema<AuthPayload> = Joi.object({
    email: Joi.string().optional(),
    password: Joi.string().optional(),
});
