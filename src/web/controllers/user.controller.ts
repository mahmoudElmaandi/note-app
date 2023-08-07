import { controller, httpPost } from "inversify-express-utils";
import { UserService } from "../../logic/services";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { CreateUserDto } from "../../logic/dtos";
import { BaseHttpResponse } from "../lib/base-http-response";
import { getCookiesOption, signJWT } from "../lib/auth-utils";


@controller('/users')
export class UserController {
    constructor(private readonly _userService: UserService) { }

    @httpPost('/signup')
    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const userDto = CreateUserDto.from(req.body);
            const { id, username } = await this._userService.signUp(userDto);
            const jwt = signJWT({ userId: id as string });
            const options = getCookiesOption();
            res.cookie('jwt', jwt, options as CookieOptions)
            const response = BaseHttpResponse.success({ jwt, username, id }, 200);
            res.status(response.statusCode).json(response);
        } catch (error) {
            const response = BaseHttpResponse.failed("failed to create user", 500);
            res.status(response.statusCode).json(response);
        }
    }

    @httpPost('/signin')
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const userDto = CreateUserDto.from(req.body);
            const existingUser = await this._userService.signIn(userDto);
            const jwt = signJWT({ userId: existingUser.id });
            const options = getCookiesOption();
            res.cookie('jwt', jwt, options as CookieOptions)
            const response = BaseHttpResponse.success({ jwt, username: existingUser.username, id: existingUser.id }, 200);
            res.status(response.statusCode).json(response);
        } catch (error) {
            const response = BaseHttpResponse.failed((error as Error).message, 500);
            res.status(response.statusCode).json(response);
        }
    }
}
