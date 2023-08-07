-- Up Migration
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(128) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_Picture VARCHAR(128),
    notify_daily_notes Boolean DEFAULT false,
    created_at TIMESTAMP DEFAULT Now()
);

CREATE TABLE NoteTypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL,
    enabled Boolean DEFAULT true,
    created_at TIMESTAMP DEFAULT Now()
);

CREATE TABLE Notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    body VARCHAR(255) NOT NULL,
    type_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT Now(),
    soft_deleted_flag Boolean DEFAULT false,

    CONSTRAINT FK_NoteType_Note FOREIGN KEY(type_id)
        REFERENCES NoteTypes(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_User_NoteSend FOREIGN KEY(sender_id)
        REFERENCES Users(id)
        ON DELETE CASCADE
);

CREATE TABLE NoteReceivers (
    note_id UUID NOT NULL,
    receiver_id UUID NOT NULL,

    CONSTRAINT PK_NoteReceivers PRIMARY KEY (note_id, receiver_id),

    CONSTRAINT FK_NoteReceiver_Note FOREIGN KEY (note_id)
        REFERENCES Notes (id)
        ON DELETE CASCADE,

    CONSTRAINT FK_NoteReceiver_User FOREIGN KEY (receiver_id)
        REFERENCES Users (id)
        ON DELETE CASCADE
);

CREATE TABLE NoteMediaFiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT Now(),

    CONSTRAINT FK_NoteMediaFiles_Note FOREIGN KEY (note_id)
        REFERENCES Notes (id)
        ON DELETE CASCADE
);

-- Down Migration
DROP TABLE IF EXISTS NoteMediaFiles;
DROP TABLE IF EXISTS NoteReceivers;
DROP TABLE IF EXISTS Notes;
DROP TABLE IF EXISTS NoteTypes;
DROP TABLE IF EXISTS Users;