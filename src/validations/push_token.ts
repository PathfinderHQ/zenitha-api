import Joi, { ObjectSchema } from 'joi';

interface PushTokenPayload {
    push_token: string;
}

export const createPushTokenSchema: ObjectSchema<PushTokenPayload> = Joi.object({
    push_token: Joi.string().required(),
});
