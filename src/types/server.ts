import express, { Request as ExpressRequest, Response as ExpressResponse, Application } from 'express';

export interface Request extends ExpressRequest {
    request_id: string;
}

export interface Response extends ExpressResponse {
    request_id: string;
}

export interface Server {
    app: Application;
}

export { Router, NextFunction, Application } from 'express';
export { Server as HttpServer } from 'http';
export { express };
