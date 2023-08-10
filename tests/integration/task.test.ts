import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';
import { HttpStatusCode } from '../../src/config';
import { createCategory, createTask, createUser, DB, disconnectDatabase, server } from '../utils';
import { generateId, generateRandomString } from '../../src/lib';
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from '../../src/validations';

jest.mock('../../src/lib', () => {
    const originalModule = jest.requireActual('../../src/lib');
    return {
        ...originalModule,
        generateTasksFromTextInput: jest
            .fn()
            .mockResolvedValueOnce([
                {
                    title: 'Visit Grandma',
                    description: 'I wish to visit my grandma',
                    time: '2023-06-30 14:00:00',
                },
            ])
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce({}),
        generateNotificationSummaryFromTask: jest.fn().mockResolvedValueOnce({
            summary: 'I wish to visit my grandma',
        }),
    };
});

describe('Task Routes', () => {
    describe('Create Task', () => {
        it('should create task', async () => {
            const { token, category } = await createCategory(DB);

            const data = {
                title: faker.word.words(),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
                category: category.id,
            };

            const result = await server().post('/tasks').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.CREATED);
            expect(result.body.data).toMatchObject({
                title: data.title,
                description: data.description,
                completed: data.completed,
                category: data.category,
            });
        });

        it('should return 400 for bad payload', async () => {
            const { token, category } = await createCategory(DB);

            const data = {
                title: faker.word.words(TASK_TITLE_MAX_LENGTH + 1),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
                category: category.id,
            };

            const result = await server().post('/tasks').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe(
                `"title" length must be less than or equal to ${TASK_TITLE_MAX_LENGTH} characters long`
            );
        });

        it('should return invalid category', async () => {
            const { token } = await createUser(DB);

            const data = {
                title: faker.word.words(),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
                category: generateId(),
            };

            const result = await server().post('/tasks').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('Invalid category');
        });
    });

    describe('Get Task', () => {
        it('should get a task', async () => {
            const { token, task } = await createTask(DB);

            const result = await server().get(`/tasks/${task.id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toMatchObject({
                title: task.title,
                description: task.description,
                completed: task.completed,
                category: task.category,
            });
        });

        it('should return task not found', async () => {
            const { token } = await createUser(DB);

            const id = generateId();

            const result = await server().get(`/tasks/${id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Task not found');
        });
    });

    describe('List Tasks', () => {
        it('should list tasks', async () => {
            const { token, data } = await createTask(DB);

            const result = await server().get('/tasks').set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toMatchObject({
                tasks: expect.arrayContaining([
                    expect.objectContaining({
                        title: data.title,
                        description: data.description,
                        completed: data.completed,
                        category: data.category,
                    }),
                ])
            });
        });
    });

    describe('Update Task', () => {
        it('should update a task', async () => {
            const { token, task } = await createTask(DB);

            const data = {
                title: faker.word.words(),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
            };

            const result = await server().put(`/tasks/${task.id}`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toMatchObject({
                title: data.title,
                description: data.description,
                completed: data.completed,
            });
        });

        it('should return task not found', async () => {
            const { token } = await createTask(DB);

            const id = generateId();

            const data = {
                title: faker.word.words(),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
            };

            const result = await server().put(`/tasks/${id}`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Task not found');
        });

        it('should fail for bad payload', async () => {
            const { token, task } = await createTask(DB);

            const data = {
                description: faker.word.words(TASK_DESCRIPTION_MAX_LENGTH + 1),
            };

            const result = await server().put(`/tasks/${task.id}`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe(
                `"description" length must be less than or equal to ${TASK_DESCRIPTION_MAX_LENGTH} characters long`
            );
        });

        it('should return invalid category', async () => {
            const { token, task } = await createTask(DB);

            const data = {
                title: faker.word.words(),
                description: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                completed: false,
                category: generateId(),
            };

            const result = await server().put(`/tasks/${task.id}`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('Invalid category');
        });
    });

    describe('Delete Task', () => {
        it('should delete a task', async () => {
            const { token, task } = await createTask(DB);

            const result = await server().delete(`/tasks/${task.id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.message).toBe('Task deleted');
        });

        it('should return task not found', async () => {
            const { token } = await createTask(DB);

            const id = generateId();

            const result = await server().delete(`/tasks/${id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Task not found');
        });
    });

    describe('Generate Tasks From Input', () => {
        it('should create generated tasks', async () => {
            const { token } = await createUser(DB);

            const data = {
                content: generateRandomString(),
            };

            const result = await server().post(`/tasks/automated`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.CREATED);
            expect(result.body.data[0]).toMatchObject({
                title: 'Visit Grandma',
                description: 'I wish to visit my grandma',
                time: '2023-06-30 14:00:00',
            });
        });

        it('should return rephrase your input', async () => {
            const { token } = await createUser(DB);

            const data = {
                content: generateRandomString(),
            };

            const result = await server().post(`/tasks/automated`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('Please rephrase your input');
        });

        it('should fail for bad payload', async () => {
            const { token } = await createUser(DB);

            const data = {};

            const result = await server().post(`/tasks/automated`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('content is required');
        });

        it('should return server error', async () => {
            const { token } = await createUser(DB);

            const data = {
                content: generateRandomString(),
            };

            const result = await server().post(`/tasks/automated`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(result.body.message).toBe('Internal Server Error');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
