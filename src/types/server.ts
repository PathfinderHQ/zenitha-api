import express, { Request as ExpressRequest, Response as ExpressResponse, Application } from 'express';
import { User, UserService } from './user';
import { EmailService } from './email';
import { OtpService } from './otp';

export interface Request extends ExpressRequest {
    request_id: string;
    user: User;
}

export interface Response extends ExpressResponse {
    request_id: string;
}

export interface Server {
    app: Application;
    userService: UserService;
    appEmailService: EmailService;
    otpService: OtpService;
}

export { Router, NextFunction, Application } from 'express';
export { Server as HttpServer } from 'http';
export { express };
