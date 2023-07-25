import { Request, Response, Router, Server } from '../types';
import { errorResponse, serverErrorResponse, validateSchema } from '../lib';
import { HttpStatusCode } from 'src/config';
import { middleware } from './middlewares';
import { Expo } from 'expo-server-sdk';
import { createPushTokenSchema } from 'src/validations';

export const userPushTokenHTTPService = (server: Server) => {
    const { isAuthenticatedUser } = middleware(server);

    const registerTokenRoutes = (router: Router) => {
        router.post('/user-push-token', isAuthenticatedUser, createUserPushToken);
    };

    const createUserPushToken = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(createPushTokenSchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            if (!Expo.isExpoPushToken(value.push_token)) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Push token is invalid');
            }

            await server.userPushTokenService.create({
                user: req.user.id,
                push_token: value.push_token,
            });

            return res.sendStatus(HttpStatusCode.NO_CONTENT);
        } catch (err) {
            return serverErrorResponse(res, 'CreateUserPushToken', err);
        }
    };
    return { registerTokenRoutes };
};
