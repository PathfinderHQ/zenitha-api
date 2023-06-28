import Joi, { ObjectSchema } from 'joi';
import { TaskCreate, TaskUpdate } from '../types';
import { isMatch } from 'date-fns';

type TaskCreatePayload = Omit<TaskCreate, 'user'>;

export const TASK_TITLE_MAX_LENGTH = 200;

export const TASK_DESCRIPTION_MAX_LENGTH = 300;

export const createTaskSchema: ObjectSchema<TaskCreatePayload> = Joi.object({
    title: Joi.string().max(TASK_TITLE_MAX_LENGTH).required(),
    description: Joi.string().max(TASK_DESCRIPTION_MAX_LENGTH).optional(),
    time: Joi.custom((value, helpers) => {
        return isMatch(value, 'yyyy-MM-dd HH:mm:ss')
            ? value
            : helpers.message({ message: 'Time contains an invalid value. Format is: yyyy-MM-dd HH:mm:ss' });
    }).optional(),
    category: Joi.string().optional(),
    completed: Joi.boolean().optional(),
});

export const updateTaskSchema: ObjectSchema<TaskUpdate> = Joi.object({
    title: Joi.string().max(TASK_TITLE_MAX_LENGTH).optional(),
    description: Joi.string().max(TASK_DESCRIPTION_MAX_LENGTH).optional(),
    time: Joi.custom((value, helpers) => {
        return isMatch(value, 'yyyy-MM-dd HH:mm:ss')
            ? value
            : helpers.message({ message: 'Time contains an invalid value. Format is: yyyy-MM-dd HH:mm:ss' });
    }).optional(),
    category: Joi.string().optional(),
    completed: Joi.boolean().optional(),
});
