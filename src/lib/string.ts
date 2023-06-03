import { customAlphabet } from 'nanoid';

export function generateId(len = 15) {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', len)();
}

export function generateOtp(len = 6) {
    return customAlphabet('1234567890', len)();
}

export function generateRandomString(options: { length: number } = { length: 10 }) {
    return customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', options.length)();
}

export function generateAPIKey() {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 30)();
}
