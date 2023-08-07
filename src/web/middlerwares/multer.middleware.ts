import multer from "multer"
import path from "path"
import { CreateNoteDto } from "../../logic/dtos";

export const multerMiddleware = () => {
    const destination = path.join(__dirname, "../../uploads");
    const storage = multer.diskStorage({
        destination,
        filename: function (req, file, cb) {
            try {
                CreateNoteDto.from({ ...req.body, sender_id: (req as any).userId });
                cb(null, Date.now() + '-' + file.originalname);
            } catch (error) {
                cb(error as Error, "")
            }
        }
    })

    return multer({
        storage,
        limits: {
            fileSize: 1782579.2,
        },
    }).array("mediaFiles")
}