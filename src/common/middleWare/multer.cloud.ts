import multer from "multer";
import { AppError } from "../utils/globalErrorHandling";
import {tmpdir}from "node:os";
import { multer_enum, StoreEnum } from "../Enum/multer.enum";

const multerCloud = ({
  customTypes=multer_enum.attachments,
  store_type=StoreEnum.memory,
}: {
  customTypes?: string[];
  store_type? : StoreEnum;
}) => {
  const storage =store_type ==StoreEnum.memory ? multer.memoryStorage() : multer.diskStorage({
    destination:tmpdir(),
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`)
    }
  });
  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) {
    if (customTypes?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type"));
    }
  }

  const upload = multer({ storage, fileFilter } as any);
  return upload;
};
export default multerCloud;