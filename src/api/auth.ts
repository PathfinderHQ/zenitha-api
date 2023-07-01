import { Request, Response, Router, Server } from '../types';
import {
    errorResponse,
    handleGoogleAuthError,
    handleToken,
    isInvalidPassword,
    serverErrorResponse,
    successResponse,
    validateSchema,
    comparePassword,
} from '../lib';
import { HttpStatusCode } from '../config';
import {
    changePasswordSchema,
    forgotPasswordSchema,
    googleAuthSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    updateProfileSchema,
    verifyEmailSchema,
} from '../validations';
import { EmailTypes, OtpType, SignInProvider } from '../types/enums';
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
        router.post('/forgot_password', forgotPassword);
        router.post('/reset_password', resetPassword);
        router.post('/verify_email', verifyEmail);
        router.post('/user/change_password', isAuthenticatedUser, changePassword);

        // uses middleware to identify user using the jwt
        router.post('/user/resend_verify', isAuthenticatedUser, resendVerifyEmailOtp);
        router.get('/user', isAuthenticatedUser, getLoggedInUser);
        router.put('/user', isAuthenticatedUser, updateProfile);
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

            // make sure the user is not google authenticated,
            // otherwise the user needs to be signed in using google
            // google signed in user do not have password
            if (foundUser.google_user_id) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Please sign in with google');
            }

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
                // all users that uses google auth, re automatically verified
                // because we are sure their email exists
                user = await server.userService.create({
                    email,
                    sign_in_provider: SignInProvider.GOOGLE,
                    google_user_id: uid,
                    verified: true,
                });
            }

            const { expiry, token } = handleToken(user);

            return successResponse(res, HttpStatusCode.OK, 'User identified', { user, token, expiry });
        } catch (err) {
            return handleGoogleAuthError(res, err);
        }
    };

    // Forgot Password endpoint, when the user hit this endpoint, we generate and send otp
    const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(forgotPasswordSchema, req.body);
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            const foundUser = await server.userService.get({ email: value.email });
            if (!foundUser) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid email');

            // create otp
            await server.otpService.create(
                {
                    user: foundUser.id,
                    type: OtpType.RESET_PASSWORD,
                    email: foundUser.email,
                },
                EmailTypes.RESET_PASSWORD
            );

            return successResponse(res, HttpStatusCode.OK, 'Reset password initiated');
        } catch (err) {
            return serverErrorResponse(res, 'ForgotPassword', err);
        }
    };

    // Reset Password endpoint
    // we check if the otp is valid and not expired
    // then reset the user password
    const resetPassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(resetPasswordSchema, req.body);
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            // fetch otp
            const foundOtp = await server.otpService.get({ otp: value.otp, type: OtpType.RESET_PASSWORD });
            if (!foundOtp) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid Otp');

            // fetch user
            const foundUser = await server.userService.get({ id: foundOtp.user });

            // update the user password
            await server.userService.update({ id: foundUser.id }, { password: value.password });

            // delete the otp from the database
            server.otpService.remove({ id: foundOtp.id });

            return successResponse(res, HttpStatusCode.OK, 'Password has been reset');
        } catch (err) {
            return serverErrorResponse(res, 'ResetPassword', err);
        }
    };

    // Verify Email endpoint, similar to reset password
    // we check if the otp is valid and not expired
    // then verify the user
    const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(verifyEmailSchema, req.body);
            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            // fetch otp
            const foundOtp = await server.otpService.get({ otp: value.otp, type: OtpType.VERIFY_EMAIL });
            if (!foundOtp) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid Otp');

            // fetch user
            const foundUser = await server.userService.get({ id: foundOtp.user });

            // verify the user
            const updatedUser = await server.userService.update({ id: foundUser.id }, { verified: true });

            // delete password from response
            delete updatedUser.password;

            // delete the otp from the database
            server.otpService.remove({ id: foundOtp.id });

            return successResponse(res, HttpStatusCode.OK, 'User verified', updatedUser);
        } catch (err) {
            return serverErrorResponse(res, 'VerifyEmail', err);
        }
    };

    // Verify Email endpoint, similar to reset password
    // we check if the otp is valid and not expired
    // then verify the user
    const resendVerifyEmailOtp = async (req: Request, res: Response): Promise<Response> => {
        try {
            if (req.user.verified) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'User is verified');
            }

            // create otp
            await server.otpService.create(
                {
                    user: req.user.id,
                    type: OtpType.VERIFY_EMAIL,
                    email: req.user.email,
                },
                EmailTypes.VERIFY_EMAIL
            );

            return successResponse(res, HttpStatusCode.OK, 'Otp sent');
        } catch (err) {
            return serverErrorResponse(res, 'ResendVerifyEmailOtp', err);
        }
    };

    const changePassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = await validateSchema(changePasswordSchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            if (!comparePassword(value.password, req.user.password)) {
                return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Wrong password');
            }

            const user = await server.userService.update({ id: req.user.id }, { password: value.new_password });

            delete user.password;

            return successResponse(res, HttpStatusCode.OK, 'Password changed', user);
        } catch (err) {
            return serverErrorResponse(res, 'ChangePassword', err);
        }
    };

    const updateProfile = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = await validateSchema(updateProfileSchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            const user = await server.userService.update({ id: req.user.id }, value);

            delete user.password;

            return successResponse(res, HttpStatusCode.OK, 'User updated', user);
        } catch (err) {
            return serverErrorResponse(res, 'UpdateProfile', err);
        }
    };

    return { registerAuthRoutes };
};
