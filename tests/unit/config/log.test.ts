import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Log, ILog, LogLevels, LogQueryCriteria, LogTypes } from '../../../src/types';
import logger, {
    buildMongoDBLogTransport,
    consoleTransport,
    formatLogResults,
    LogService,
} from '../../../src/config/log';
import { generateRandomString } from '../../../src/lib';

import { LogModel } from '../../../src/database';

describe('Logger', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Format Logs', () => {
        it('should format log', () => {
            const log = {
                level: LogLevels.info,
                time: Date.now(),
                app_name: faker.word.words(),
                message: faker.word.words(),
                code: faker.number.int(),
                log_id: faker.word.words(),
                type: LogTypes.info,
                data: {},
                created_at: new Date(),
                updated_at: new Date(),
                id: generateRandomString(),
            } as ILog;

            const result = formatLogResults([log]);

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        level: log.level,
                        type: log.type,
                        data: log.data,
                        code: log.code,
                        id: log.id,
                        message: log.message,
                    }),
                ])
            );
        });
    });

    describe('Build MongoDB Log Transport', () => {
        jest.spyOn(mongoose, 'connect').mockResolvedValue({} as any);

        const transport = buildMongoDBLogTransport();

        describe('Write Logs', () => {
            const log = {
                level: LogLevels.info,
                time: Date.now(),
                pid: faker.number.int(),
                hostname: faker.string.alphanumeric(),
                name: faker.word.words(),
                message: faker.word.words(),
                code: faker.number.int(),
                id: faker.word.words(),
                type: LogTypes.info,
                msg: faker.word.words(),
            };

            it('should write logs', async () => {
                const spy = jest.spyOn(LogModel, 'create').mockImplementation();

                await transport.write(JSON.stringify(log));

                expect(spy).toHaveBeenCalled();
            });

            it('should throw error', async () => {
                jest.spyOn(LogModel, 'create').mockImplementation(() => {
                    throw new Error();
                });

                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                await transport.write(JSON.stringify(log));

                expect(consoleSpy).toHaveBeenCalled();
            });
        });

        describe('Get Logs', () => {
            const criteria = {
                id: faker.word.words(),
                app_name: faker.word.words(),
                code: faker.number.int(),
                type: faker.word.words(),
                limit: 100,
            } as LogQueryCriteria;

            it('should get logs', async () => {
                const expected: Log[] = [];

                const findSpy = jest.spyOn(LogModel, 'find');

                const limitMock = jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue([]),
                });

                findSpy.mockReturnValue({
                    limit: limitMock,
                } as any);

                const result = await transport.getLogs(criteria);

                expect(result).toEqual(expected);
            });

            it('should throw error', async () => {
                jest.spyOn(LogModel, 'find').mockImplementation(() => {
                    throw new Error();
                });

                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                await transport.getLogs(criteria);

                expect(consoleSpy).toHaveBeenCalled();
            });
        });
    });

    describe('Console Transport', () => {
        const transport = consoleTransport;

        it('should write logs', async () => {
            const log = faker.word.words();

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await transport.write(log);

            expect(consoleSpy).toHaveBeenCalled();
        });

        it('should get logs', async () => {
            const expected: Log[] = [];

            const result = await transport.getLogs({} as LogQueryCriteria);

            expect(result).toEqual(expected);
        });
    });

    describe('Log Service', () => {
        it('should return existing log service instance', () => {
            const secondLogger = new LogService();

            expect(secondLogger).toBe(logger);
        });

        it('should log info', () => {
            const spy = jest.spyOn(logger, 'info');

            logger.info({}, 'Info');

            expect(spy).toHaveBeenCalled();
        });

        it('should log fatal', () => {
            const spy = jest.spyOn(logger, 'fatal');

            logger.fatal(new Error(), 'Fatal');

            expect(spy).toHaveBeenCalled();
        });
    });
});
