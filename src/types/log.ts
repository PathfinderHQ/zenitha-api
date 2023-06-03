import { Document } from 'mongoose';

export enum LogLevels {
    fatal = 'fatal',
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
    trace = 'trace',
    silent = 'silent',
}

export interface ILog extends Document {
    level: LogLevels;
    time: number;
    app_name: string;
    message: string;
    code: number;
    log_id: string;
    type: LogTypes;
    data: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}

export type UnknownObject = Record<string, unknown>;

export enum LogTypes {
    request = 'request',
    response = 'response',
    fatal = 'error',
    error = 'error',
    info = 'info',
    debug = 'debug',
}

export type Log = {
    level: LogLevels;
    type: LogTypes;
    data: Record<string, unknown> | Error;
    code?: number;
    id?: string;
    message?: string;
};

export type LogWriteObject = {
    level: LogLevels;
    time: number;
    pid: number;
    hostname: string;
    name: string;
    message?: string;
    code?: number;
    id: string;
    type: LogTypes;
    msg?: string;
};

export type LogQueryCriteria = {
    id: string;
    app_name: string;
    code: number;
    type: string;
    limit: number;
};

export interface LogTransport {
    write: (log: string) => Promise<void>;
    getLogs: (criteria: LogQueryCriteria) => Promise<Log[]>;
}
