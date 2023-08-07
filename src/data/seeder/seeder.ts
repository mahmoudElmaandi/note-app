import { hashPassword } from './../../web/lib/auth-utils';
import { Pool, PoolClient } from "pg";
import poolConfig from '../../configs/database-config.json';
import { noteTypes, users } from './data.json';

async function seedNoteTypes(pool: Pool | PoolClient) {
    Object.entries(noteTypes).forEach(async ([name, id]) => {
        await pool.query(`INSERT INTO NoteTypes (id,name) VALUES($1,$2) `, [id, name])
    })
}

async function seedUsers(pool: Pool | PoolClient) {
    Object.entries(users).forEach(async ([name, id]) => {
        const hashedPassword = hashPassword(name)
        await pool.query(`INSERT INTO Users (id,username,password) VALUES($1,$2,$3) `, [id, name, hashedPassword])
    })
};

export async function seedData(client: Pool | PoolClient) {
    const noteTypes = (await client.query(`SELECT COUNT(id) as length FROM NoteTypes`)).rows[0].length;
    const noUsers = (await client.query(`SELECT COUNT(id) as length FROM Users`)).rows[0].length;

    if (!parseInt(noteTypes)) {
        await seedNoteTypes(client)
        console.log('noteTypes is seeded');
    }
    else console.log(`${noteTypes} noteTypes is already seeded`);

    if (!parseInt(noUsers)) {
        await seedUsers(client);
        console.log('users is seeded');
    }
    else console.log(`${noUsers} users is already seeded`);
};

(async () => {
    const pool = new Pool(poolConfig);
    // await seedData(pool);
})();