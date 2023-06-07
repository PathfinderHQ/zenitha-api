import { comparePassword, hashPassword, isInvalidPassword } from '../../../src/lib';

describe('Bcrypt', () => {
    describe('Hash Password', () => {
        it('should hash password', () => {
            const password = 'password';

            const result = hashPassword(password);

            expect(result).not.toEqual(password);
        });
    });

    describe('Invalid Password', () => {
        it('should return false for invalid password', () => {
            const password = 'password';

            const hashedPassword = hashPassword(password);

            const result = isInvalidPassword(password, hashedPassword);

            expect(result).toBeFalsy();
        });

        it('should return true for invalid password', () => {
            const password = 'password';

            const hashedPassword = hashPassword(password);

            const result = isInvalidPassword('wrongpassword', hashedPassword);

            expect(result).toBeTruthy();
        });
    });

    describe('Compare Password', () => {
        it('should compare password and return true', () => {
            const password = 'password';

            const hashedPassword = hashPassword(password);

            const result = comparePassword(password, hashedPassword);

            expect(result).toBeTruthy();
        });

        it('should return true for invalid password', () => {
            const password = 'password';

            const hashedPassword = hashPassword(password);

            const result = comparePassword('wrongpassword', hashedPassword);

            expect(result).toBeFalsy();
        });
    });
});
