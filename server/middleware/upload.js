import multer from "multer";
import AppError from "../utils/AppError.js";

// Files are held in memory only long enough to stream to Cloudinary —
// nothing is written to disk, so /uploads is just a placeholder folder.
const storage = multer.memoryStorage();

const ALLOWED = {
  image: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf"],
};

const fileFilter = (kind) => (req, file, cb) => {
  if (ALLOWED[kind].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type for ${file.fieldname}. Allowed: ${ALLOWED[kind].join(", ")}`, 400));
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter("image"),
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: fileFilter("document"),
});
