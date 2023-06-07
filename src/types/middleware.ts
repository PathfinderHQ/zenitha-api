import { NextFunction, Request, Response } from './server';

export interface MiddlewareService {
    isAuthenticatedUser(req: Request, res: Response, next: NextFunction): Promise<void | Response>;
}
