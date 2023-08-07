import { Socket } from "socket.io";
import { verifyJWT } from "../lib/auth-utils";
import { ExtendedError } from "socket.io/dist/namespace";

export function authSocketMiddleware(socket: Socket, next: (err: ExtendedError | undefined) => void) {
    const token = socket.handshake.auth.token;
    try {
        const decoded = verifyJWT(token);
        socket.data.userId = decoded.userId;
    } catch (err) {
        return next(new Error("NOT AUTHORIZED"));
    }
    next(undefined);
};