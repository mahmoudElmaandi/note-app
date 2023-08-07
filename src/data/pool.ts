import pg, { Pool } from "pg";
import { seedData } from "./seeder/seeder";
import poolConfig from '../configs/database-config.json';
import { injectable } from "inversify";

@injectable()
export class DBPool {
    public pool: Pool = new Pool(poolConfig);

    constructor() {
        this.setTypeParser();
    }

    setTypeParser() {
        const types = pg.types;
        types.setTypeParser(types.builtins.TIMESTAMP, function (val) {
            return val
        })
    }

    async testConnection() {
        try {
            console.log(`Testing pool conntection`);
            const client = await this.pool.connect()
            await client.query('SELECT NOW()')
            console.log(`Pool Connection successed`);
            console.log(`Seeding data`);
            await seedData(client);
            client.release();
        } catch (error) {
            console.log(`Conntection to DB Failed : ${error}`)
            process.exit(1);
            throw new Error(`Conntection to DB Failed : ${error}`);
        }
    }
};