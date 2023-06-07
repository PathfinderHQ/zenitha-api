import { Server, Request, Response, NextFunction, MiddlewareService } from '../../types';
import { errorResponse, verifyToken } from '../../lib';
import { HttpStatusCode } from '../../config';

// This function is used to validate that endpoints thar requires
// headers actually receive the headers and is the API supported one
export function isValidAuthorization(bearerToken: string): { token?: string; error?: string } {
    if (!bearerToken) return { error: 'Please specify authorization header' };

    const parts = bearerToken.split(' ');

    if (parts.length !== 2) return { error: 'Please specify correct authorization header' };

    const [scheme, token] = parts;

    if (!/Bearer/.test(scheme)) return { error: 'Please specify correct authorization header' };

    return { token };
}

// Middlewares intercept request and modifies or handles what
// is designed to do and passes it on to the function that
// is meant to handle the route logic
// https://expressjs.com/en/guide/writing-middleware.html
export function middleware(server: Server): MiddlewareService {
    /**
     * Authenticated users can be identified using the jwt that
     * was issued to the user on register or login
     * This function decrypts the token and retrieve the id stored within
     * then gets the user using the id
     * */
    const isAuthenticatedUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // check if the token passed and uses the correct headers
            const { error, token } = isValidAuthorization(req.headers.authorization);
            if (error) {
                return errorResponse(res, HttpStatusCode.UNAUTHORIZED, error);
            }

            // verify the token is valid
            const { id } = verifyToken(token);

            // get the user whose id was retrieved from the token
            const user = await server.userService.get({ id });

            // if no user is found, the token is invalid
            if (!user) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid token');

            // store the user in the current request object
            req.user = user;

            // this next function lets the functions moves on the next function where the route was mounted
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Token expired');
            }

            return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Not authorized to access this route');
        }
    };

    return { isAuthenticatedUser };
}
