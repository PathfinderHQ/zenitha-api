import express, { Request as ExpressRequest, Response as ExpressResponse, Application } from 'express';
import { User, UserService } from './user';

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
}

export { Router, NextFunction, Application } from 'express';
export { Server as HttpServer } from 'http';
export { express };
