import { express, Application, Request, Response, NextFunction, Server } from '../types';
import Config from '../config';
import { logRequestMiddleware } from '../config/log';
import { connection, createMysqlAdapter } from '../database';
import * as services from '../services';

const startExpressApp = (): Application => {
    const app = express();

    app.set('port', Config.port);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Accept, Content-Length, Content-Type, Authorization');
        next();
    });

    app.use(logRequestMiddleware());

    app.get('/', (req: Request, res: Response) => {
        return res.status(200).json({
            message: `Let's build`,
        });
    });

    return app;
};

export const createNewServer = (): Server => {
    const app = startExpressApp();
    const DB = createMysqlAdapter(connection);

    const userService = services.newUserStore({ DB });

    const server: Server = {
        app,
        userService,
    };

    const router = express.Router();

    app.use('/', router);

    return server;
};
