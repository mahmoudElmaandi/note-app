import { injectable } from "inversify";
import { Pool } from "pg";
import { DBContext } from "../db.context";
import { IUser } from "../../../types";

@injectable()
export class UserRepository {
    private pool: Pool;
    constructor(private readonly dbContext: DBContext) {
        this.pool = this.dbContext.db.pool;
    }

    async create(user: Partial<IUser>) {
        return (await this.pool.query('INSERT INTO Users (username,password) VALUES($1,$2) RETURNING id,username', [user.username, user.password])).rows[0]
    }

    async getUserByUsername(username: string) {
        const result = await this.pool.query('SELECT * From Users WHERE username = $1', [username]);
        if (!result.rowCount) return null;
        return result.rows[0]
    }
}