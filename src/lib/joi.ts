import { ObjectSchema } from 'joi';

export function validateSchema<T>(schema: ObjectSchema<T>, body: any, opts: any = {}) {
    const { error, value } = schema.validate(body, {
        abortEarly: false,
        allowUnknown: opts.allowUnknown || false,
    });

    if (error) {
        let [
            {
                message: errorMessage,
                type: errorType,
                context: { key },
            },
        ] = error.details;

        if (errorType === 'any.required') errorMessage = `${key} is required`;

        if (errorType === 'string.pattern.base' && key === 'password') {
            errorMessage =
                'Password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character';
        }

        if (errorType === 'string.pattern.base' && key === 'new_password') {
            errorMessage =
                'New password should be minimum of 8 characters, must contain at least 1 Uppercase letter, 1 lower case, 1 number and 1 special character';
        }

        if (errorType === 'object.unknown') {
            errorMessage = `Unknown/Unexpected parameter: '${error.details[0].context.key}'`;
        }

        return { error: errorMessage };
    }

    return { value };
}
