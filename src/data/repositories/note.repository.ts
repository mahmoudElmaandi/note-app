import { Pool } from "pg";
import { DataBaseCursor, INote } from "../../../types";
import { DBContext } from "../db.context";
import { injectable } from "inversify";

@injectable()
export class NoteRepository {
    private pool: Pool;
    constructor(private readonly dbContext: DBContext) {
        this.pool = this.dbContext.db.pool;
    }

    async list() {
        return (await this.pool.query('SELECT * FROM Notes')).rows
    }

    async paginate(dataBaseCursor: DataBaseCursor) {
        const query = `
        SELECT * FROM Notes 
        WHERE sender_id = '${dataBaseCursor.user_id}'
        AND soft_deleted_flag = false
        AND created_at ${dataBaseCursor.operator} '${dataBaseCursor.created_at}'
        ${dataBaseCursor.isTimeline ? `AND created_at >= CURRENT_DATE - INTERVAL '30 days'` : ""}
        ${dataBaseCursor.filters.length ? 'AND ' + dataBaseCursor.filters.map(filter => `type_id = '${filter}'`).join(' OR ') : ""}
        ORDER BY created_at ${dataBaseCursor.orderBy}
        LIMIT ${dataBaseCursor.limit}`;
        return (await this.pool.query(query)).rows
    }

    async create(note: Partial<INote>) {
        const type_id = await this.getNoteTypeIdByName(note.type!, true);
        if (!type_id) throw new Error("Note type is disabled");
        return (await this.pool.query('INSERT INTO Notes (title,body,type_id,sender_id) VALUES ($1,$2,$3,$4) RETURNING id,created_at',
            [note.title, note.body, type_id, note.sender_id])).rows[0]
    }

    async softDelete(note: Partial<INote>) {
        const result = await this.pool.query('UPDATE Notes SET soft_deleted_flag = true WHERE id = $1 AND sender_id = $2 RETURNING soft_deleted_flag;', [note.id, note.sender_id])
        if (!result.rowCount) return false
        return result.rows[0].soft_deleted_flag
    }

    async getOldestNoteTimestamp(userId: string) {
        return (await this.pool.query('SELECT Min(created_at) as timestamp FROM Notes WHERE sender_id = $1;', [userId])).rows[0].timestamp
    }

    async getLatestNoteTimestamp(userId: string) {
        return (await this.pool.query('SELECT Max(created_at) as lts FROM Notes WHERE sender_id = $1 ;', [userId])).rows[0].lts
    }

    async total(userId: string) {
        return parseInt((await this.pool.query('SELECT Count(created_at) as total FROM Notes WHERE sender_id = $1;', [userId])).rows[0].total)
    }

    async getNextDayDate() {
        return (await this.pool.query(`SELECT NOW()::TIMESTAMP + INTERVAL '1 DAY' as next_day_date`)).rows[0].next_day_date
    }

    async getNoteTypeIdByName(name: string, isEnabled: boolean): Promise<string> {
        const result = await this.pool.query(`SELECT id FROM NoteTypes WHERE name = $1 AND enabled = $2;`, [name, isEnabled])
        return result.rowCount ? result.rows[0].id : null
    }

    async getNoteTypeNameById(id: string, isEnabled: boolean): Promise<string> {
        const result = await this.pool.query(`SELECT name FROM NoteTypes WHERE id = $1 AND enabled = $2;`, [id, isEnabled])
        return result.rowCount ? result.rows[0].name : null
    }

    async getDailyStats(userId: string) {
        const result = await this.pool.query(`
        SELECT nt.name, Count(nt.name)
        FROM Notes as n 
        JOIN  NoteTypes as nt
        ON sender_id = $1 AND date(n.created_at) = CURRENT_DATE
        AND nt.id = n.type_id AND nt.enabled = true
        GROUP BY nt.name`,
            [userId]
        )
        if (!result.rowCount) return []
        return result.rows
    }
};