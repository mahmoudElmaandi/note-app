import confing from '../../configs/config';
import jwt from "jsonwebtoken";
import crypto from 'crypto';

export const signJWT = (payload: { userId: string }) => {
    return jwt.sign(payload, confing.JWT_SECRET, {
        expiresIn: '20d'
    })
}

export const verifyJWT = (jwtToken: string): { userId: string } => {
    return jwt.verify(jwtToken, confing.JWT_SECRET) as { userId: string }
}

export const hashPassword = (password: string) => {
    return crypto
        .pbkdf2Sync(password, confing.PASSWORD_SALT, 42, 64, 'sha512')
        .toString('hex');
}

export const getCookiesOption = () => {
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    return {
        expires: new Date(Date.now() + expiresIn),
        sameSite: "none",
        secure: true,
        httpOnly: false
    };
}