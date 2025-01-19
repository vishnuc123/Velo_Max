import multer from "multer";
import path from "path";

// Storage for general uploads
const generalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("public", "Admin", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Storage for product uploads
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("public", "Admin", "uploads", "products"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Memory storage for product uploads
const productMemoryStorage = multer.memoryStorage();

// Create upload instances
export const upload = multer({ storage: generalStorage });
export const productUpload = multer({ storage: productStorage });
export const productMemoryUpload = multer({ storage: productMemoryStorage });
