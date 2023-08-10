import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';
import { createTask, createUser, DB, disconnectDatabase } from '../../utils';
import { TaskCreate, TaskService } from '../../../src/types';
import { newTaskStore } from '../../../src/services';
import { generateId } from '../../../src/lib';

describe('Task Service', () => {
    let taskService: TaskService;

    beforeAll(() => {
        taskService = newTaskStore({ DB });
    });

    describe('Create', () => {
        it('should create a task', async () => {
            const { user } = await createUser(DB);

            const data: TaskCreate = {
                user: user.id,
                title: faker.word.words(),
                description: faker.word.words(),
                summary: faker.word.words(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            };

            const [result] = await taskService.create([data]);

            expect(result).toMatchObject({
                user: data.user,
                title: data.title,
                description: data.description,
            });
        });
    });

    describe('List', () => {
        it('should return list of tasks', async () => {
            const { task } = await createTask(DB);

            const result = await taskService.list({
                id: task.id,
                title: task.title,
                completed: task.completed,
                user: task.user,
                category: task.category,
                time: task.time,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: task.id,
                        title: task.title,
                        completed: task.completed,
                        user: task.user,
                        category: task.category,
                        time: task.time,
                    }),
                ])
            );
        });

        it('should return empty list of tasks', async () => {
            const result = await taskService.list({
                id: generateId(),
                title: faker.word.noun(),
                completed: true,
                user: generateId(),
                category: generateId(),
                time: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            });

            expect(result).toEqual(expect.arrayContaining([]));
        });
    });

    describe('Update', () => {
        it('should update task', async () => {
            const { task } = await createTask(DB);

            const data = {
                title: faker.word.noun(),
                description: faker.word.words(),
                completed: true,
            };

            const result = await taskService.update({ id: task.id }, data);

            expect(result).toMatchObject({
                title: data.title,
                description: data.description,
                completed: data.completed,
            });
        });

        it('should return task when update payload is empty', async () => {
            const { task } = await createTask(DB);

            const data = {};

            const result = await taskService.update({ id: task.id }, data);

            expect(result).toMatchObject({
                title: task.title,
                description: task.description,
                completed: task.completed,
            });
        });

        it('should return undefined', async () => {
            const data = {
                title: faker.word.noun(),
                description: faker.word.words(),
                completed: true,
            };

            const result = await taskService.update({ id: generateId() }, data);

            expect(result).toBeUndefined();
        });
    });

    describe('Get', () => {
        it('should get a task', async () => {
            const { task } = await createTask(DB);

            const result = await taskService.get({ id: task.id });

            expect(result).toMatchObject({
                id: task.id,
                title: task.title,
                description: task.description,
                completed: task.completed,
                time: task.time,
            });
        });

        it('should return undefined', async () => {
            const result = await taskService.get({ id: generateId() });

            expect(result).toBeUndefined();
        });
    });

    describe('Remove', () => {
        it('should remove task', async () => {
            const { task } = await createTask(DB);

            // delete the task
            await taskService.remove({ id: task.id });

            const result = await taskService.get({ id: task.id });

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
