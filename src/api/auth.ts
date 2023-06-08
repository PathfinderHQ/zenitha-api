import { Request, Response, Router, Server } from '../types';
import {
    errorResponse,
    handleGoogleAuthError,
    handleToken,
    isInvalidPassword,
    serverErrorResponse,
    successResponse,
    validateSchema,
} from '../lib';
import { HttpStatusCode } from '../config';
import { googleAuthSchema, loginSchema, registerSchema } from '../validations';
import { SignInProvider } from '../types/enums';
import { middleware } from './middlewares';
import firebase from '../lib/firebase';

export const authHTTPService = (server: Server) => {
    // retrieve middleware function for usage
    const { isAuthenticatedUser } = middleware(server);

    // mount auth routes in this function
    const registerAuthRoutes = (router: Router) => {
        router.post('/register', register);
        router.post('/login', login);
        router.post('/google/auth', googleAuth);

        // uses middleware to identify user using the jwt
        router.get('/user', isAuthenticatedUser, getLoggedInUser);
    };

    /**
     * Register endpoint function
     * This endpoint is used to register using email and password
     * */
    const register = async (req: Request, res: Response): Promise<Response> => {
        try {
            // validate the req body using the defined schema
            const { error, value } = await validateSchema(registerSchema, req.body);

            // return error if the request body fails validation
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            // check for existing user
            const foundUser = await server.userService.get({ email: value.email });

            // return error if the user exists
            if (foundUser) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'User already exists');

            // create new user
            const user = await server.userService.create({
                ...value,
                sign_in_provider: SignInProvider.CUSTOM,
            });

            // delete password from the user. It's a bad practice to return password in response
            delete user.password;

            // generate jsonwebtoken for the user
            const { token, expiry } = handleToken(user);

            return successResponse(res, HttpStatusCode.CREATED, 'Registration successful', { user, token, expiry });
        } catch (err) {
            return serverErrorResponse(res, 'Register', err);
        }
    };

    /**
     * Login endpoint function
     * This endpoint is used to log in using email and password
     * */
    const login = async (req: Request, res: Response): Promise<Response> => {
        try {
            // validate the req body using the defined schema
            const { error, value } = await validateSchema(loginSchema, req.body);

            // return error if the request body fails validation
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            // check for existing user
            const foundUser = await server.userService.get({ email: value.email });

            // return error if the user does not exist
            if (!foundUser) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid email/password');

            // check if the password is correct
            // since we hash the password before saving to the database
            // this function hashes the password that is passed in req.body
            // and compare the hash generated with the hashed password in the database
            // if it does not match. The password is incorrect
            // https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
            if (isInvalidPassword(value.password, foundUser.password)) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid email/password');
            }

            const { expiry, token } = handleToken(foundUser);

            return successResponse(res, HttpStatusCode.OK, 'Login successful', { user: foundUser, token, expiry });
        } catch (err) {
            return serverErrorResponse(res, 'Login', err);
        }
    };

    /**
     * Get logged in endpoint function
     * This endpoint uses the jsonwebtoken (jwt) passed in the request to identify the user
     * However we are not handling everything in this function
     * There's a middleware that we pass when mounting this route above
     * Once it's able to identify the user using the jwt
     * it adds the user detail to the request object
     * and it can be gotten as req.user
     * the logic is handled in the middleware
     */
    const getLoggedInUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const user = req.user;

            // remove password from current user
            delete user.password;

            return successResponse(res, HttpStatusCode.OK, 'User retrieved', user);
        } catch (err) {
            return serverErrorResponse(res, 'GetLoggedInUser', err);
        }
    };

    /**
     * This endpoint handles the logic to register or login a user using google
     * A Google auth code will be passed as a payload
     * Firebase admin will be used to retrieve the user email from the token
     * then we'll create the user if he does not exist or we'll just change the
     * user to google sign if the user already exists
     * then issue our server token to the user
     * The function serves two purposes because both sign in and sign up action on google
     * will always return a token. And we'll end up using the token same way in register and login
     * so, it's easy to handle both case in one function (controller)
     */
    const googleAuth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // validate the req body using the defined schema
            const { error, value } = await validateSchema(googleAuthSchema, req.body);

            // return error if the request body fails validation
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            // retrieve the user email using the google token received from req.body
            const { email, uid } = await firebase.auth().verifyIdToken(value.token);

            // search for user
            let user = await server.userService.get({ email });

            // if user is not found, create a new user
            if (!user) {
                user = await server.userService.create({
                    email,
                    sign_in_provider: SignInProvider.GOOGLE,
                    google_user_id: uid,
                });
            }

            const { expiry, token } = handleToken(user);

            return successResponse(res, HttpStatusCode.OK, 'User identified', { user, token, expiry });
        } catch (err) {
            return handleGoogleAuthError(res, err);
        }
    };

    return { registerAuthRoutes };
};
