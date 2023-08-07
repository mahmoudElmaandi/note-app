import { ValidationException } from "../excpetions";

export class CreateNoteDto {
    constructor(
        public readonly title: string,
        public readonly body: string,
        public readonly type: string,
        public readonly sender_id: string,
        public readonly receiver_ids: string[],
        public readonly mediaFiles: Express.Multer.File[],
    ) { }

    static from(body: Partial<CreateNoteDto>) {
        if (!body.title) throw new ValidationException("Missing property title");
        if (!body.body) throw new ValidationException("Missing property body");
        if (!body.type) throw new ValidationException("Missing property type");
        if (!body.sender_id) throw new ValidationException("Missing property sender_id");
        if (!body.receiver_ids || !body.receiver_ids.length) throw new ValidationException("Missing property receiver_ids");

        return new CreateNoteDto(body.title, body.body, body.type, body.sender_id, body.receiver_ids, body.mediaFiles!)
    }

    static toReceivedNote(note: Partial<CreateNoteDto>) {
        return { title: note.title, body: note.body, type: note.type }
    }
}