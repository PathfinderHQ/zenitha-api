import './config';
import Server from './server';
import logger from './config/log';

Server.start();

process.on('uncaughtException', (err: Error) => {
    logger.error(err, '[UncaughtException]');
});

process.on('unhandledRejection', (err: Error) => {
    logger.error(err, '[UnhandledRejection]');
});
