import { faker } from '@faker-js/faker';
import { HttpStatusCode } from '../../src/config';
import { createCategory, createUser, DB, disconnectDatabase, server } from '../utils';
import { generateId } from '../../src/lib';
import { CATEGORY_NAME_MAX_LENGTH } from '../../src/validations';

describe('Category Routes', () => {
    describe('Create Category', () => {
        it('should create category', async () => {
            const { token } = await createUser(DB);

            const data = {
                name: faker.word.noun(),
            };

            const result = await server().post('/categories').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.CREATED);
            expect(result.body.data).toMatchObject({ name: data.name });
        });

        it('should return 400 for bad payload', async () => {
            const { token } = await createUser(DB);

            const data = {
                name: generateId(CATEGORY_NAME_MAX_LENGTH + 1),
            };

            const result = await server().post('/categories').send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe(
                `"name" length must be less than or equal to ${CATEGORY_NAME_MAX_LENGTH} characters long`
            );
        });
    });

    describe('Get Category', () => {
        it('should get a category', async () => {
            const { token, category } = await createCategory(DB);

            const result = await server().get(`/categories/${category.id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toMatchObject({ name: category.name });
        });

        it('should return category not found', async () => {
            const { token } = await createCategory(DB);

            const id = generateId();

            const result = await server().get(`/categories/${id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Category not found');
        });
    });

    describe('List Categories', () => {
        it('should list categories', async () => {
            const { token, data } = await createCategory(DB);

            const result = await server().get('/categories').set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: data.name,
                        user: data.user,
                    }),
                ])
            );
        });
    });

    describe('Update Category', () => {
        it('should update a category', async () => {
            const { token, category } = await createCategory(DB);

            const data = {
                name: faker.word.noun(),
            };

            const result = await server()
                .put(`/categories/${category.id}`)
                .send(data)
                .set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.data).toMatchObject({ name: data.name });
        });

        it('should return category not found', async () => {
            const { token } = await createCategory(DB);

            const id = generateId();

            const data = {
                name: faker.word.noun(),
            };

            const result = await server().put(`/categories/${id}`).send(data).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Category not found');
        });

        it('should fail for bad payload', async () => {
            const { token, category } = await createCategory(DB);

            const data = {};

            const result = await server()
                .put(`/categories/${category.id}`)
                .send(data)
                .set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(result.body.message).toBe('name is required');
        });
    });

    describe('Delete Category', () => {
        it('should delete a category', async () => {
            const { token, category } = await createCategory(DB);

            const result = await server().delete(`/categories/${category.id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.OK);
            expect(result.body.message).toBe('Category deleted');
        });

        it('should return category not found', async () => {
            const { token } = await createCategory(DB);

            const id = generateId();

            const result = await server().delete(`/categories/${id}`).set('Authorization', `Bearer ${token}`);

            expect(result.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(result.body.message).toBe('Category not found');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
