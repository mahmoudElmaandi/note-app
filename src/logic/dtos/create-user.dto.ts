import { ValidationException } from "../excpetions";

export class CreateUserDto {

    constructor(
        public readonly username: string,
        public readonly password: string,
    ) { }

    static from(body: Partial<CreateUserDto>) {
        if (!body.username) throw new ValidationException("Missing property username");
        if (!body.password) throw new ValidationException("Missing property password");

        return new CreateUserDto(body.username, body.password);
    }


}