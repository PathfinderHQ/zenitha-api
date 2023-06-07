// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import request from 'supertest';
import { createNewServer } from '../../src/api';

export const server = () => {
    const { app } = createNewServer();

    return request(app);
};
