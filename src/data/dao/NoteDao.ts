import { INote } from "../../../types";

export interface NoteDao {
    createNote(note: INote): Promise<void>,
    deleteNote(id: string): Promise<void>
}