import { issueToken, returnExpiry, verifyToken } from '../../../src/lib';

describe('Token Service', () => {
    describe('Issue Token', () => {
        it('should issue token', () => {
            const payload = { id: '123' };

            const token = issueToken(payload);

            expect(token).toBeDefined();
        });
    });

    describe('Verify Token', () => {
        it('should verify token', () => {
            const payload = { id: '123' };
            const token = issueToken(payload);

            const result = verifyToken(token);

            expect(result.id).toEqual(payload.id);
        });
    });

    describe('Return Expiry', () => {
        it('should return expiry', () => {
            const payload = { id: '123' };
            const token = issueToken(payload);

            const result = returnExpiry(token);

            const currentTime = Date.now() / 1000;

            expect(result).toBeGreaterThan(currentTime);
        });
    });
});
