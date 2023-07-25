import './config';
import Server from './server';
import logger from './config/log';
import { agenda } from './lib';

Server.start();

//starts agenda
agenda
    .start()
    .then(() => console.log('Agenda service running...'))
    .catch((error) => console.error('error starting Agenda service', error));

process.on('uncaughtException', (err: Error) => {
    logger.error(err, '[UncaughtException]');
});

process.on('unhandledRejection', (err: Error) => {
    logger.error(err, '[UnhandledRejection]');
});
