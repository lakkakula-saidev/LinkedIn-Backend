import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const cloudinaryStorage = new CloudinaryStorage({ cloudinary, params: { folder: "avatars" } })
const upload = multer({ storage: cloudinaryStorage }).single("avatar")