import ServiceProductItem from "../models/ServiceProduct.model.js";
import slugify from "slugify"
import {v2 as cloudinary} from "cloudinary"


export const getAllServiceProducts = async (req, res) => {
  try {
    const data = await ServiceProductItem.find({}); 
    return res.status(200).json(data)
  } catch (err) {
    console.error("getAllServiceProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Permite parsear JSON cuando viene como string en multipart
const parseJSON = (v, fallback = undefined) => {
  try {
    if (typeof v !== "string") return fallback;
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

// Normaliza texto
const normText = (v) =>
  typeof v === "string" ? v.trim() : v;

// Coerce boolean desde string ("true"/"false") o boolean
const toBool = (v, def = true) => {
  if (v === undefined || v === null) return def;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
};

// Coerce number
const toNum = (v, def = undefined) => {
  if (v === undefined || v === null || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// Sube una imagen (buffer) a Cloudinary
const uploadToCloudinary = async (file, folder = "service-products") => {
  const MAX_MB = 5;
  if (!file?.mimetype?.startsWith?.("image/")) {
    throw new Error(`Archivo ${file?.originalname ?? ""} no es una imagen válida`);
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Imagen ${file.originalname} supera ${MAX_MB}MB`);
  }
  const dataURI = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: "image",
  });
  return { url: res.secure_url, public_id: res.public_id };
};

// Limpia en Cloudinary si hubo fallos posteriores
const cleanupCloudinary = async (publicIds = []) => {
  if (!publicIds.length) return;
  await Promise.allSettled(
    publicIds.map((id) =>
      cloudinary.uploader.destroy(id, { resource_type: "image" })
    )
  );
};

// Construye el payload final desde req.body (texto) + imágenes ya subidas
const buildPayload = ({ body, images, userId }) => {
  const title = normText(body.title);
  const type  = normText(body.type);

  // Arrays que podrían venir como JSON string
  const tags      = parseJSON(body.tags, []);
  const locations = parseJSON(body.locations, []);
  const mpMeta    = parseJSON(body.mpMetadata, undefined);
  const alts      = parseJSON(body.alts, []); // para alt por imagen (opcional)

  // Enriquecer cada imagen con alt correspondiente (si se envió)
  const imagesWithAlt = images.map((img, idx) => ({
    url: img.url,
    public_id: img.public_id,
    alt: typeof alts?.[idx] === "string" ? alts[idx] : "",
  }));

  // Armado final con normalizaciones
  const payload = {
    title,
    slug: normText(body.slug) || slugify(title ?? "", { lower: true, strict: true }),
    type,
    category: normText(body.category),
    shortDescription: normText(body.shortDescription),
    description: normText(body.description),

    price: toNum(body.price),
    currency: normText(body.currency) || "CLP",
    active: toBool(body.active, true),

    stock: toNum(body.stock, 0),

    delivery: normText(body.delivery),
    images: imagesWithAlt,

    durationMinutes: toNum(body.durationMinutes),
    capacity: toNum(body.capacity),

    locations: Array.isArray(locations) ? locations : [],
    tags: Array.isArray(tags) ? tags : [],

    mpMetadata: mpMeta,
    createdBy: userId || undefined,
  };

  // Quitar undefined para no pisar defaults
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  return payload;
};

/** **********************
 * Controllers
 *************************/

/**
 * POST /api/service-products
 * multipart/form-data
 *  - images[]  (archivos)
 *  - otros campos de texto
 */
export const createServiceProduct = async (req, res) => {
  const uploadedIds = []; // para cleanup si algo falla
  try {
    // Validaciones mínimas
    if (!req.body?.title || !req.body?.type) {
      return res.status(400).json({ message: "title y type son obligatorios" });
    }
    const type = String(req.body.type).trim();
    if (!["product", "service"].includes(type)) {
      return res.status(400).json({ message: "type debe ser 'product' o 'service'" });
    }

    // Subida de imágenes (si hay)
    const files = req.files || [];
    const uploaded = [];
    for (const f of files) {
      const img = await uploadToCloudinary(f, "service-products");
      uploaded.push(img);
      uploadedIds.push(img.public_id);
    }

    // Payload final y creación
    const payload = buildPayload({
      body: req.body,
      images: uploaded,
      userId: req.user?.id,
    });

    const created = await ServiceProductItem.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    // Revertir imágenes si falló la creación
    await cleanupCloudinary(uploadedIds);
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Ya existe un registro con ese valor único",
        keyValue: err.keyValue,
      });
    }
    console.error("createServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

