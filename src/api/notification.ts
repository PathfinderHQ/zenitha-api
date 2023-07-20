import { Request, Response, Router, Server } from '../types';
import { errorResponse, serverErrorResponse, successResponse } from '../lib';
import { HttpStatusCode } from 'src/config';
import { middleware } from './middlewares';
import { Expo } from 'expo-server-sdk';

export const tokenHTTPService = (server: Server) => {
    const { isAuthenticatedUser } = middleware(server);

    const tokenRoutes = (router: Router) => {
        router.post('/user-push-token', isAuthenticatedUser, getUserPushToken);
    };

    const getUserPushToken = async (req: Request, res: Response): Promise<Response> => {
        try {
            const user_push_token = await server.userPushTokenService.get({ user: req.user.id });

            if (!Expo.isExpoPushToken(user_push_token)) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'push_token is required');
            }

            return successResponse(res, HttpStatusCode.OK, 'User push token get');
        } catch (err) {
            return serverErrorResponse(res, 'CreateUserPushToken', err);
        }
    };
    return { tokenRoutes };
};
