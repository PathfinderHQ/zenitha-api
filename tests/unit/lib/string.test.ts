import { generateAPIKey, generateId, generateOtp, generateRandomString } from '../../../src/lib';

describe('String', () => {
    describe('Generate Id', () => {
        it('should generate id with default length', () => {
            const id = generateId();

            expect(id).toBeDefined();
            expect(id.length).toBe(15);
        });

        it('should generate id with defined length', () => {
            const length = 20;
            const id = generateId(length);

            expect(id).toBeDefined();
            expect(id.length).toEqual(length);
        });
    });

    describe('Generate Random String', () => {
        it('should generate random string with default length', () => {
            const value = generateRandomString();

            const DEFAULT_LENGTH = 10;

            expect(value).toBeDefined();
            expect(value.length).toBe(DEFAULT_LENGTH);
        });

        it('should generate random string with defined length', () => {
            const length = 20;
            const value = generateRandomString({ length });

            expect(value).toBeDefined();
            expect(value.length).toEqual(length);
        });

        it('should generate random strings', () => {
            const length = 20;
            const valueOne = generateRandomString({ length });
            const valueTwo = generateRandomString({ length });

            expect(valueOne).toBeDefined();
            expect(valueTwo).toBeDefined();

            expect(valueOne).not.toEqual(valueTwo);
        });
    });

    describe('Generate Random OTP', () => {
        it('should generate random otp with default length', () => {
            const value = generateOtp();

            const DEFAULT_LENGTH = 6;

            expect(value).toBeDefined();
            expect(value.length).toBe(DEFAULT_LENGTH);
        });

        it('should generate random otp with defined length', () => {
            const length = 20;
            const value = generateOtp(length);

            expect(value).toBeDefined();
            expect(value.length).toEqual(length);
        });

        it('should generate random otps', () => {
            const length = 20;
            const valueOne = generateOtp(length);
            const valueTwo = generateOtp(length);

            expect(valueOne).toBeDefined();
            expect(valueTwo).toBeDefined();

            expect(valueOne).not.toEqual(valueTwo);
        });
    });

    describe('Generate API Key', () => {
        it('should generate api key', () => {
            const apiKey = generateAPIKey();

            expect(apiKey).toBeDefined();
            expect(apiKey.length).toBe(30);
        });
    });
});
