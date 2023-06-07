import { server } from '../utils';
import { HttpStatusCode } from '../../src/config';

describe('Base Route', () => {
    it('should be healthy', async () => {
        const response = await server().get('/');

        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toMatchObject({
            message: `Let's build`,
        });
    });
});
