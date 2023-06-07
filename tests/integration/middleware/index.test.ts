import { server, issueBadToken, issueExpiredToken, disconnectDatabase } from '../../utils';
import { HttpStatusCode } from '../../../src/config';

describe('Middlewares', () => {
    describe('Validate Authorization Header', () => {
        it('should return 401 when no token is passed', async () => {
            const response = await server().get('/user').send({});

            expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
            expect(response.body.message).toBe('Please specify authorization header');
        });

        it('should return 401 with incorrect headers', async () => {
            const response = await server().get('/user').send({}).set('Authorization', 'test');

            expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
            expect(response.body.message).toBe('Please specify correct authorization header');
        });

        it('should return 401 with unsupported headers', async () => {
            const response = await server().get('/user').send({}).set('Authorization', 'Bean test');

            expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
            expect(response.body.message).toBe('Please specify correct authorization header');
        });
    });

    describe('Validate Authenticated User', () => {
        it('should return 400 with expired token', async () => {
            const token = issueExpiredToken();

            const response = await server().get('/user').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Token expired');
        });

        it('should return 400 with bad token', async () => {
            const token = issueBadToken();

            const response = await server().get('/user').send({}).set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(HttpStatusCode.BAD_REQUEST);
            expect(response.body.message).toBe('Not authorized to access this route');
        });
    });

    afterAll(async () => {
        await disconnectDatabase();
    });
});
