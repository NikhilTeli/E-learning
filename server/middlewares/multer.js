import multer from 'multer';     //used for uploading files
import {v4 as uuid} from 'uuid';

const storage = multer.diskStorage({
    destination(req,file,cb){
        cb(null, "uploads")
    },
    filename(req,file,cb){
        const id = uuid()

        const extName = file.originalname.split(".").pop(); //for file extension 

        const fileName = `${id}.${extName}`;

        cb(null, fileName);
    },
});

export const uploadFiles = multer({ storage }).single("file");