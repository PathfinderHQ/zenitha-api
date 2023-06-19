import { express, Application, Request, Response, NextFunction, Server } from '../types';
import Config from '../config';
import { logRequestMiddleware } from '../config/log';
import { connection, createMysqlAdapter } from '../database';
import * as services from '../services';
import { authHTTPService } from './auth';
import { logHTTPService } from './log';

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
    // create express app
    const app = startExpressApp();

    // create database connection
    const DB = createMysqlAdapter(connection);

    // create required services
    const appEmailService = services.emailService();
    const otpService = services.newOtpStore({ DB, appEmailService });
    const userService = services.newUserStore({ DB, appEmailService });

    // build server object with all the required services
    const server: Server = {
        app,
        userService,
        appEmailService,
        otpService,
    };

    // create the express router
    const router = express.Router();

    // mount routes

    // mount auth endpoints
    authHTTPService(server).registerAuthRoutes(router);
    logHTTPService().registerLogRoutes(router);

    app.use('/', router);

    return server;
};
