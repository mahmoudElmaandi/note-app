import { hashPassword } from './../../web/lib/auth-utils';
import { injectable } from "inversify";
import { UserRepository } from "../../data/repositories";
import { CreateUserDto } from "../dtos";
import { IUser } from '../../../types';

@injectable()
export class UserService {
    constructor(private readonly _userRepo: UserRepository) { }

    async signUp(user: CreateUserDto): Promise<Partial<IUser>> {
        const hashedPassword = hashPassword(user.password);
        const hashedUser = CreateUserDto.from({ username: user.username, password: hashedPassword });
        return await this._userRepo.create(hashedUser)
    };

    async signIn(user: CreateUserDto): Promise<IUser> {
        const existingUser = await this._userRepo.getUserByUsername(user.username)
        if (!existingUser) throw new Error('user not found');

        const hashedPassword = hashPassword(user.password);
        if (hashedPassword != existingUser.password) throw new Error("wrong password")
        return existingUser
    }

}