import bcrypt from 'bcryptjs';
import { BCRYPT_SALT } from '../config';

export const isInvalidPassword = (passwordToCompare: string, userPassword: string): boolean => {
    return !bcrypt.compareSync(passwordToCompare, userPassword);
};

export const comparePassword = (passwordToCompare: string, userPassword: string): boolean => {
    return bcrypt.compareSync(passwordToCompare, userPassword);
};

export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, BCRYPT_SALT);
};
