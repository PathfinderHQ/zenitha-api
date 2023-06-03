import * as Joi from 'joi';
import { validateSchema } from '../../../src/lib';
import { PASSWORD_REGEX } from '../../../src/config';

describe('Validate Schema', () => {
    it('should pass validation', () => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
        });

        const data = {
            first_name: 'John',
            last_name: 'Doe',
        };

        const { error, value } = validateSchema(schema, data);

        expect(error).toBeUndefined();
        expect(value).toMatchObject(data);
    });

    it('should fail validation', () => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
        });

        const data = {
            first_name: 'John',
        };

        const { error, value } = validateSchema(schema, data);

        expect(error).toBe('last_name is required');
        expect(value).toBeUndefined();
    });

    it('should fail password validation', () => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
        });

        const data = {
            first_name: 'John',
            password: 'Test',
        };

        const { error, value } = validateSchema(schema, data);

        expect(error).toBe(
            'Password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character'
        );
        expect(value).toBeUndefined();
    });

    it('should fail new password validation', () => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            new_password: Joi.string().pattern(new RegExp(PASSWORD_REGEX)).required(),
        });

        const data = {
            first_name: 'John',
            new_password: 'Test',
        };

        const { error, value } = validateSchema(schema, data);

        expect(error).toBe(
            'New password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character'
        );
        expect(value).toBeUndefined();
    });

    it('should fail validation for unknown parameter', () => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
        });

        const data = {
            first_name: 'John',
            size: 'Big',
        };

        const { error, value } = validateSchema(schema, data);

        expect(error).toBe(`Unknown/Unexpected parameter: 'size'`);
        expect(value).toBeUndefined();
    });
});
