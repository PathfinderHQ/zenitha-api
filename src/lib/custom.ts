import { FirebaseError } from 'firebase-admin';
import { Response } from '../types';
import { FirebaseAuthError } from '../types/enums';
import logger from '../config/log';
import { HttpStatusCode } from '../config';
import { errorResponse } from './response';

export type CustomError = Error & FirebaseError;

// Handles the firebase register/login error
export const handleGoogleAuthError = (res: Response, error: CustomError): Response => {
    let message = '';
    let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;

    const errorType = error.code;

    // check for error code and send correct message
    switch (errorType) {
        case FirebaseAuthError.TOKEN_REVOKED:
        case FirebaseAuthError.EXPIRED_TOKEN:
            statusCode = HttpStatusCode.BAD_REQUEST;
            message = 'Token expired, please login again.';
            break;

        case FirebaseAuthError.ARGUMENT_ERROR:
        case FirebaseAuthError.INVALID_ARGUMENT:
        case FirebaseAuthError.INVALID_TOKEN:
            statusCode = HttpStatusCode.BAD_REQUEST;
            message = 'Invalid token';
            break;

        case FirebaseAuthError.INTERNAL_ERROR:
        default:
            message = 'Internal Server Error';
    }

    // log the error
    logger.error(error, '[GoogleAuth]');

    // return the response
    return errorResponse(res, statusCode, message);
};

export const generateJSONFromBase64 = (base64Data: string) => {
    return Buffer.from(base64Data, 'base64').toString('utf8');
};
