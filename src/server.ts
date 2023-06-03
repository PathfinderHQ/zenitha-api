import { HttpServer } from './types';
import Config from './config';
import { createNewServer } from './api';
import logger from './config/log';

let server: HttpServer;
export default {
    start(): Promise<HttpServer> {
        return new Promise((resolve) => {
            server = createNewServer().app.listen(Config.port, () => {
                if (Config.nodeEnv === 'development') {
                    logger.info({}, `Server is LIVE ⚡️ on port: ${Config.port}`);
                }
                return resolve(server);
            });
        });
    },
    stop() {
        return new Promise((resolve) => {
            server.close(() => {
                return resolve(server);
            });
        });
    },
};
