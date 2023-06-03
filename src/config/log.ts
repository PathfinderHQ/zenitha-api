import pino from 'pino';

import {
    Log,
    ILog,
    LogLevels,
    LogTypes,
    LogTransport,
    LogWriteObject,
    NextFunction,
    Request,
    Response,
    UnknownObject,
} from '../types';
import { generateRandomString } from '../lib';
import Config from '../config';
import { createMongoDBAdapter, LogModel } from '../database';

function formatLogResults(results: ILog[] = []): Log[] {
    return results.map((result) => ({
        level: result.level,
        type: result.type,
        data: result.data,
        code: result.code,
        id: result.id,
        message: result.message,
    }));
}

function buildMongoDBLogTransport(): LogTransport {
    createMongoDBAdapter(Config.logUrl).then();

    return {
        async write(log: string) {
            const logObject: LogWriteObject = JSON.parse(log);

            try {
                await LogModel.create({
                    level: logObject.level,
                    time: logObject.time,
                    app_name: logObject.name,
                    message: logObject.message || logObject.msg,
                    code: logObject.code,
                    log_id: logObject.id,
                    type: logObject.type,
                    data: logObject,
                });
            } catch (err) {
                console.error(err);
            }
        },
        async getLogs(criteria) {
            try {
                const { limit = 100, ...query } = criteria;
                const results = await LogModel.find({ ...query })
                    .limit(limit)
                    .sort('-time');

                return formatLogResults(results);
            } catch (err) {
                console.error(err);
            }
        },
    };
}

const consoleTransport: LogTransport = {
    write(log): Promise<void> {
        console.log(log);
        return;
    },
    getLogs() {
        return Promise.resolve([]);
    },
};

/**
 Error Serializer to log error object
 as error object will not be logged normally
 */
const errorSerializer = (err: Error) => {
    return {
        message: err.message,
        stack: err.stack,
        name: err.name,
        ...err,
    };
};

class LogService {
    private static instance: LogService;
    private transport: LogTransport;
    private readonly logger: any;

    constructor(transport: LogTransport = consoleTransport) {
        if (LogService.instance) {
            return LogService.instance;
        }

        this.transport = transport;
        this.logger = pino(
            {
                name: 'alt-address',
                redact: ['password', 'body.password', 'body.new_password'],
            },
            transport
        );

        LogService.instance = this;
    }

    log({ level, type, data, message, id = generateRandomString() }: Log): void {
        this.logger[level]({ ...data, id, type, level }, message || String(data.message));
    }

    info(data: UnknownObject, message?: string): void {
        this.log({ data, level: LogLevels.info, type: LogTypes.info, message });
    }

    error(err: Error, message?: string): void {
        this.log({ data: errorSerializer(err), level: LogLevels.error, type: LogTypes.error, message });
    }

    fatal(err: Error, message?: string): void {
        this.log({ data: err, level: LogLevels.fatal, type: LogTypes.fatal, message });
    }

    request(id: string, data: UnknownObject): void {
        this.log({ id, data, level: LogLevels.info, type: LogTypes.request });
    }

    response(id: string, code: number, response: UnknownObject): void {
        this.log({ id, data: { ...response, code }, level: LogLevels.info, type: LogTypes.response });
    }
}

const logger = new LogService(Config.nodeEnv === 'production' ? buildMongoDBLogTransport() : undefined);

export function logRequestMiddleware() {
    return function (req: Request, res: Response, next: NextFunction) {
        const requestId = generateRandomString();
        req.request_id = requestId;
        res.request_id = requestId;
        logger.request(requestId, {
            route: req.route,
            url: req.url,
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    };
}

export default logger;
