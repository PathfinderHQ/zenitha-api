import { Router, Request, Response } from 'src/types/server';
import { LogQueryCriteria } from 'src/types/log';
import logger from '../config/log';

export const logHTTPService = () => {
    const registerLogRoutes = (router: Router) => {
        router.get('/xp/logs', searchLogs);
    };

    const searchLogs = async (req: Request, res: Response): Promise<Response> => {
        const query = handleQuery(req);

        const result = await logger.transport.getLogs(query);
        return res.status(200).json({
            message: 'Logs retrieved',
            data: result,
        });
    };

    return { registerLogRoutes };
};

const handleQuery = (req: Request): LogQueryCriteria => {
    const query = {} as LogQueryCriteria;
    const limit = 20;

    if (req.query.id) query.id = String(req.query.id);
    if (req.query.app_name) query.app_name = String(req.query.app_name);
    if (req.query.type) query.type = String(req.query.type);
    if (req.query.code) query.code = Number(req.query.code);
    query.limit = req.query.limit ? Number(req.query.limit) : limit;

    return query;
};
