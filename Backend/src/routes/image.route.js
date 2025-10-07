import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import  auth  from "../middlewares/auth.js"; 

const routerCloudinary = Router();
const upload = multer({ storage: multer.memoryStorage() });

routerCloudinary.post("/upload/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    // Validaciones básicas
    const MAX_MB = 5;
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Tipo de archivo inválido" });
    }
    if (req.file.size > MAX_MB * 1024 * 1024) {
      return res.status(400).json({ error: "Imagen demasiado grande (máx 5MB)" });
    }

    // Subir como base64
    const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "service-products",    // opcional
      resource_type: "image",
      
    });

    return res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    console.error("Cloudinary upload error:", e);
    return res.status(500).json({ error: "No se pudo subir la imagen" });
  }
});

export default routerCloudinary;