import { sign, verify, JwtPayload } from 'jsonwebtoken';
import Config from '../config';
import { User } from '../types';

const { jwtSecret, jwtExpiry } = Config;

export function issueToken(payload: JwtPayload, expiry = jwtExpiry) {
    return sign(payload, jwtSecret, {
        expiresIn: expiry,
        notBefore: 0,
    });
}

export function verifyToken(token: string): any {
    return verify(token, jwtSecret);
}

export function returnExpiry(token: string): any {
    return verifyToken(token).exp;
}

export const handleToken = (data: User): { token: string; expiry: number } => {
    const token = issueToken({ id: data.id });
    const expiry = returnExpiry(token);

    return { token, expiry };
};
