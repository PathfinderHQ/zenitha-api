import { faker } from '@faker-js/faker';
import { createCategory, DB, disconnectDatabase } from '../../utils';
import { CategoryCreate, CategoryService } from '../../../src/types';
import { newCategoryStore } from '../../../src/services';
import { generateId } from '../../../src/lib';

describe('Category Service', () => {
    let categoryService: CategoryService;

    beforeAll(() => {
        categoryService = newCategoryStore({ DB });
    });

    describe('Create', () => {
        it('should create a category', async () => {
            const data: CategoryCreate = {
                name: faker.word.noun(),
            };

            const result = await categoryService.create(data);

            expect(result).toMatchObject({ name: data.name });
        });
    });

    describe('List', () => {
        it('should list categories', async () => {
            const { data } = await createCategory(DB);

            const result = await categoryService.list({
                name: data.name,
                user: data.user,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: data.name,
                        user: data.user,
                    }),
                ])
            );
        });

        it('should return empty list', async () => {
            const result = await categoryService.list({
                name: faker.word.noun(),
                user: faker.word.noun(),
            });

            expect(result).toEqual(expect.arrayContaining([]));
        });
    });

    describe('Update', () => {
        it('should update category', async () => {
            const { category } = await createCategory(DB);

            const data = {
                name: faker.word.noun(),
            };

            const result = await categoryService.update({ id: category.id }, data);

            expect(result).toMatchObject({
                name: data.name,
            });
        });

        it('should return undefined', async () => {
            const data = {
                name: faker.word.noun(),
            };

            const result = await categoryService.update({ id: generateId() }, data);

            expect(result).toBeUndefined();
        });
    });

    describe('Get', () => {
        it('should get a category', async () => {
            const { category } = await createCategory(DB);

            const result = await categoryService.get({ id: category.id });

            expect(result).toMatchObject({
                name: category.name,
            });
        });

        it('should return undefined', async () => {
            const result = await categoryService.get({ id: generateId() });

            expect(result).toBeUndefined();
        });
    });

    describe('Remove', () => {
        it('should remove a category', async () => {
            const { category } = await createCategory(DB);

            await categoryService.remove({ id: category.id });

            const result = await categoryService.get({ id: category.id });

            expect(result).toBeUndefined();
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
