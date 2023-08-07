import { injectable } from "inversify";
import { INoteMediaFile } from "../../../types";
import { DBContext } from "../db.context";

@injectable()
export class NoteMediaFileRepository {
    constructor(private readonly _dbContext: DBContext) { }

    async create(noteMediaFile: Partial<INoteMediaFile>) {
        await this._dbContext.db.pool.query('INSERT INTO NoteMediaFiles (note_id,file_name,file_type,file_size,file_path) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [noteMediaFile.note_id, noteMediaFile.file_name, noteMediaFile.file_type, noteMediaFile.file_size, noteMediaFile.file_path]);
    }
}