export interface IUser {
    id: string,
    username: string,
    password: string,
    profilePicture: string,
    notify_daily_notes: boolean,
    created_at: number
};

export interface INote {
    id: string,
    title: string,
    body: string,
    type: string,
    sender_id: string,
    receiver_ids: string[],
    soft_deleted_flag: boolean,
    mediaFiles: Express.Multer.File[],
    created_at: string
};

export interface INoteReceiver {
    note_id: string,
    receiver_id: string
}

export interface INoteMediaFile {
    id: string,
    note_id: string
    file_name: string,
    file_type: string,
    file_size: number,
    file_path: string,
    created_at: string,
}

export interface Cursor {
    direction: "prev" | "next",
    created_at: string
}

export interface DataBaseCursor {
    operator: ">" | "<",
    orderBy: " ASC " | " DESC ",
    limit: number,
    user_id: string,
    created_at: string,
    filters: string[],
    isTimeline: boolean
}