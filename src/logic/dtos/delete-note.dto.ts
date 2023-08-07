import { ValidationException } from "../excpetions";

export class DeleteNoteDto {
    constructor(
        public readonly id: string,
        public readonly sender_id: string,
    ) { }

    static from(params: Partial<DeleteNoteDto>) {
        if (!params.id) throw new ValidationException("Missing params id");
        if (!params.sender_id) throw new ValidationException("Forbidden");

        return new DeleteNoteDto(params.id, params.sender_id)
    }
}