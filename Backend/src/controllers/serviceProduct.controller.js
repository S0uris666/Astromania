import ServiceProductItem from "../models/ServiceProduct.model.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";


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

// Extrae id de usuario
const getUserId = (u) => u?.id || u?._id || u?.userId || null;

// Extrae id de propietario del documento
const getOwnerId = (doc) =>
  doc?.createdBy?._id || doc?.createdBy || doc?.owner?._id || doc?.owner || doc?.user?._id || doc?.user || null;

// Verifica si el usuario puede editar/eliminar el recurso
// Nota: los endpoints ya están protegidos por authRol("admin");

const canEdit = (doc, user) => {
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") return true;
  const ownerId = getOwnerId(doc);
  const uid = getUserId(user);
  return ownerId && uid && String(ownerId) === String(uid);
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

export const updateServiceProduct = async (req, res) => {
  const uploadedIds = []; // para revertir si algo falla
  try {
    const { id } = req.params;

    const doc = await ServiceProductItem.findById(id);
    if (!doc) return res.status(404).json({ message: "Producto/Servicio no encontrado" });

    // permisos (opcional, quítalo si no usas auth)
    if (!canEdit(doc, req.user)) {
      return res.status(403).json({ message: "No tienes permisos para editar este recurso" });
    }

    // 1) Subir nuevas imágenes
    const files = req.files || [];
    const newImages = [];
    for (const f of files) {
      const img = await uploadToCloudinary(f, "service-products");
      newImages.push(img);
      uploadedIds.push(img.public_id);
    }

    // 2) Remover imágenes antiguas si se pide
    const removePublicIds = parseJSON(req.body?.removePublicIds, []);
    const prevImages = Array.isArray(doc.images) ? [...doc.images] : [];
    let images = prevImages.filter(
      (img) => !removePublicIds.includes(img.public_id)
    );
    // concatenar nuevas (sin alt o puedes aceptar "alts" como en create)
    images = images.concat(
      newImages.map((img) => ({ url: img.url, public_id: img.public_id, alt: "" }))
    );

    // 3) Construir payload parcial (no pisar con undefined)
    const title = normText(req.body?.title);
    const payload = {
      title,
      slug:
        normText(req.body?.slug) ||
        (title ? slugify(title, { lower: true, strict: true }) : doc.slug),

      type: normText(req.body?.type) ?? doc.type,
      category: normText(req.body?.category) ?? doc.category,
      shortDescription: normText(req.body?.shortDescription) ?? doc.shortDescription,
      description: normText(req.body?.description) ?? doc.description,

      price: toNum(req.body?.price, doc.price),
      currency: normText(req.body?.currency) ?? (doc.currency || "CLP"),
      active: toBool(req.body?.active, doc.active ?? true),

      stock: toNum(req.body?.stock, doc.stock),

      delivery: normText(req.body?.delivery) ?? doc.delivery,

      durationMinutes: toNum(req.body?.durationMinutes, doc.durationMinutes),
      capacity: toNum(req.body?.capacity, doc.capacity),

      // arrays desde JSON string (si no vienen, mantenemos las previas)
      locations: parseJSON(req.body?.locations, doc.locations || []),
      tags: parseJSON(req.body?.tags, doc.tags || []),

      mpMetadata: parseJSON(req.body?.mpMetadata, doc.mpMetadata),

      images,
    };

    // limpiar undefined para no sobreescribir con undefined
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const updated = await ServiceProductItem.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    // 4) Limpiar en Cloudinary las imágenes removidas
    if (Array.isArray(removePublicIds) && removePublicIds.length) {
      await cleanupCloudinary(removePublicIds);
    }

    return res.status(200).json(updated);
  } catch (err) {
    // revertir imágenes recién subidas si falló algo
    await cleanupCloudinary(uploadedIds);
    console.error("updateServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const deleteServiceProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await ServiceProductItem.findById(id);
    if (!doc) return res.status(404).json({ message: "Producto/Servicio no encontrado" });

    // permisos (opcional, quítalo si no usas auth)
    if (!canEdit(doc, req.user)) {
      return res.status(403).json({ message: "No tienes permisos para eliminar este recurso" });
    }

    // borra doc
    await ServiceProductItem.findByIdAndDelete(id);

    // borra imágenes en Cloudinary
    const publicIds = (doc.images || []).map((i) => i.public_id).filter(Boolean);
    await cleanupCloudinary(publicIds);

    return res.status(200).json({ message: "Eliminado correctamente" });
  } catch (err) {
    console.error("deleteServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
