import { injectable } from "inversify";
import { CreateNoteDto, DeleteNoteDto } from "../dtos";
import { NoteReceiverRepository, NoteRepository, NoteMediaFileRepository } from "../../data/repositories";

@injectable()
export class NoteService {
    private readonly _noteRepo: NoteRepository;
    private readonly _noteReceiverRepo: NoteReceiverRepository;
    private readonly _noteMediaFileRepo: NoteMediaFileRepository;


    constructor(noteRepo: NoteRepository, noteReceiverRepo: NoteReceiverRepository, noteMediaFileRepo: NoteMediaFileRepository) {
        this._noteRepo = noteRepo;
        this._noteReceiverRepo = noteReceiverRepo;
        this._noteMediaFileRepo = noteMediaFileRepo;
    };

    async list() {
        return this._noteRepo.list()
    };

    async create(note: Partial<CreateNoteDto>) {
        const { id: note_id, created_at } = await this._noteRepo.create(note);
        for (let receiverIndex = 0; receiverIndex < note.receiver_ids!.length; receiverIndex++) {
            const receiver_id = note.receiver_ids![receiverIndex];
            await this._noteReceiverRepo.create({ note_id, receiver_id })
        }
        await Promise.all(note.mediaFiles!.map(({ filename, mimetype, size, path }) => {
            return this._noteMediaFileRepo.create({
                file_name: filename,
                file_path: path,
                file_type: mimetype,
                file_size: size,
                note_id
            })
        }));
        return { note_id, ...note, created_at }
    }

    async softDelete(note: DeleteNoteDto) {
        return await this._noteRepo.softDelete(note)
    }
};