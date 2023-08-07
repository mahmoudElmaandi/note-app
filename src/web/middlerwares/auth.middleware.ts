import jsonwebtoken from "jsonwebtoken";
import { verifyJWT } from "../lib/auth-utils";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const jwt = req.headers.authorization?.split(' ')[1];
    console.log("jwt", jwt)
    if (!jwt) {
        return res.status(401).send({ error: "no token" });
    }

    let payload;
    try {
        payload = verifyJWT(jwt) as { userId: string };
    } catch (error) {
        if (error instanceof jsonwebtoken.TokenExpiredError) {
            return res.status(401).send({ error: "expired token" });
        }
        return res.status(401).send({ error: "bad token" });
    }
    (req as any).userId = payload.userId;
    res.locals.userId = payload.userId;
    return next()
};