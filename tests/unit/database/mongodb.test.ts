import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { createMongoDBAdapter } from '../../../src/database';
describe('MongoDB Adapter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to mongodb database', async () => {
        const url = faker.internet.url();

        jest.spyOn(mongoose, 'connect').mockResolvedValue({} as any);

        await expect(createMongoDBAdapter(url)).resolves.not.toThrow();
    });

    it('should throw error connecting to mongodb database', async () => {
        const url = faker.internet.url();

        jest.spyOn(mongoose, 'connect').mockImplementation(() => {
            throw new Error();
        });

        await expect(createMongoDBAdapter(url)).rejects.toThrow();
    });
});
