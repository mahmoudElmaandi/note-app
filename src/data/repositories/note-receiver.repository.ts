import { injectable } from "inversify";
import { INoteReceiver } from "../../../types";
import { DBContext } from "../db.context";

@injectable()
export class NoteReceiverRepository {
    constructor(private readonly _dbContext: DBContext) { }

    async create(noteReceiver: INoteReceiver) {
        await this._dbContext.db.pool.query('INSERT INTO NoteReceivers (note_id,receiver_id) VALUES ($1,$2)',
            [noteReceiver.note_id, noteReceiver.receiver_id]);
    }
}