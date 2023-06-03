import { express, Application, Request, Response, NextFunction, Server } from '../types';
import Config from '../config';
import { logRequestMiddleware } from '../config/log';

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

    const server: Server = {
        app,
    };

    const router = express.Router();

    app.use('/', router);

    return server;
};
