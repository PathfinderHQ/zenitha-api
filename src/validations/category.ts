import Joi, { ObjectSchema } from 'joi';

interface CategoryPayload {
    name: string;
}

export const CATEGORY_NAME_MAX_LENGTH = 100;

export const createCategorySchema: ObjectSchema<CategoryPayload> = Joi.object({
    name: Joi.string().max(CATEGORY_NAME_MAX_LENGTH).required(),
});

export const updateCategorySchema: ObjectSchema<CategoryPayload> = Joi.object({
    name: Joi.string().max(CATEGORY_NAME_MAX_LENGTH).required(),
});
