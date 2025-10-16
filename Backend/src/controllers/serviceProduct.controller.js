import ServiceProductItem from "../models/ServiceProduct.model.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";

export const getAllServiceProducts = async (_req, res) => {
  try {
    const data = await ServiceProductItem.find({});
    return res.status(200).json(data);
  } catch (err) {
    console.error("getAllServiceProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const parseJSON = (value, fallback = undefined) => {
  try {
    if (typeof value !== "string") return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normText = (value) => {
  if (value === null || value === undefined) return undefined;
  return String(value).trim();
};

const toBool = (value, def = true) => {
  if (value === undefined || value === null) return def;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const toNum = (value, def = undefined) => {
  if (value === undefined || value === null || value === "") return def;
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const sanitizeTags = (value) =>
  toArray(value)
    .map((tag) => normText(tag)?.toLowerCase())
    .filter(Boolean);

const sanitizeLocations = (value) =>
  toArray(value)
    .map((location) => normText(location))
    .filter(Boolean);

const sanitizeLinks = (value) => {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value
        .split(/[\n,;]/g)
        .map((url) => ({ url: url.trim() }))
        .filter((entry) => entry.url)
    : [];

  return entries
    .map((entry) => {
      if (typeof entry === "string") {
        const url = normText(entry);
        return url ? { label: "", url } : null;
      }
      if (entry && typeof entry === "object") {
        const url = normText(entry.url || entry.href || entry.link);
        if (!url) return null;
        return {
          label: normText(entry.label || entry.title) || "",
          url,
        };
      }
      return null;
    })
    .filter(Boolean);
};

const cleanEmptyStrings = (obj = {}) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string" && obj[key].trim() === "") {
      obj[key] = undefined;
    }
  });
  return obj;
};

const getUserId = (user) => user?.id || user?._id || user?.userId || null;

const getOwnerId = (doc) =>
  doc?.createdBy?._id ||
  doc?.createdBy ||
  doc?.owner?._id ||
  doc?.owner ||
  doc?.user?._id ||
  doc?.user ||
  null;

const canEdit = (doc, user) => {
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") return true;
  const ownerId = getOwnerId(doc);
  const uid = getUserId(user);
  return ownerId && uid && String(ownerId) === String(uid);
};

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

const cleanupCloudinary = async (publicIds = []) => {
  if (!publicIds.length) return;
  await Promise.allSettled(
    publicIds.map((id) =>
      cloudinary.uploader.destroy(id, { resource_type: "image" })
    )
  );
};

const buildPayload = ({ body, images, userId }) => {
  const title = normText(body.title);
  const type = normText(body.type);

  const tagsInput = parseJSON(body.tags, body.tags);
  const locationsInput = parseJSON(body.locations, body.locations);
  const linksInput = parseJSON(body.links, body.links);
  const mpMeta = parseJSON(body.mpMetadata, undefined);
  const alts = parseJSON(body.alts, []);

  const imagesWithAlt = images.map((img, idx) => ({
    url: img.url,
    public_id: img.public_id,
    alt: typeof alts?.[idx] === "string" ? alts[idx] : "",
  }));

  const payload = {
    title,
    slug: normText(body.slug) || slugify(title ?? "", { lower: true, strict: true }),
    type,
    category: normText(body.category),
    shortDescription: normText(body.shortDescription),
    description: normText(body.description),
    location: normText(body.location),

    price: toNum(body.price),
    currency: normText(body.currency) || "CLP",
    active: toBool(body.active, true),

    stock: toNum(body.stock, 0),
    delivery: normText(body.delivery),
    images: imagesWithAlt,

    durationMinutes: toNum(body.durationMinutes),
    capacity: toNum(body.capacity),

    locations: sanitizeLocations(locationsInput),
    tags: sanitizeTags(tagsInput),
    links: sanitizeLinks(linksInput),

    mpMetadata: mpMeta,
    createdBy: userId || undefined,
  };

  cleanEmptyStrings(payload);

  if (payload.type === "activity") {
    delete payload.price;
    delete payload.currency;
    delete payload.stock;
    delete payload.delivery;
    delete payload.durationMinutes;
    delete payload.capacity;
    payload.locations = [];
    delete payload.mpMetadata;
  } else {
    payload.location = undefined;
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  return payload;
};

export const createServiceProduct = async (req, res) => {
  const uploadedIds = [];
  try {
    if (!req.body?.title || !req.body?.type) {
      return res.status(400).json({ message: "title y type son obligatorios" });
    }

    const type = String(req.body.type).trim();
    if (!["product", "service", "activity"].includes(type)) {
      return res
        .status(400)
        .json({ message: "type debe ser 'product', 'service' o 'activity'" });
    }

    const files = req.files || [];
    const uploaded = [];
    for (const file of files) {
      const img = await uploadToCloudinary(file, "service-products");
      uploaded.push(img);
      uploadedIds.push(img.public_id);
    }

    const payload = buildPayload({
      body: req.body,
      images: uploaded,
      userId: req.user?.id,
    });

    const created = await ServiceProductItem.create(payload);
    return res.status(201).json(created);
  } catch (err) {
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
  const uploadedIds = [];
  try {
    const { id } = req.params;
    const doc = await ServiceProductItem.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Producto/Servicio no encontrado" });
    }

    if (!canEdit(doc, req.user)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para editar este recurso" });
    }

    const files = req.files || [];
    const newImages = [];
    for (const file of files) {
      const img = await uploadToCloudinary(file, "service-products");
      newImages.push(img);
      uploadedIds.push(img.public_id);
    }

    const removePublicIds = parseJSON(req.body?.removePublicIds, []);
    const previousImages = Array.isArray(doc.images) ? [...doc.images] : [];
    let images = previousImages.filter(
      (img) => !removePublicIds.includes(img.public_id)
    );
    images = images.concat(
      newImages.map((img) => ({ url: img.url, public_id: img.public_id, alt: "" }))
    );

    const payload = { images };

    if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
      const title = normText(req.body.title);
      if (title) {
        payload.title = title;
        payload.slug =
          normText(req.body.slug) ||
          slugify(title, { lower: true, strict: true });
      }
    } else if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
      payload.slug = normText(req.body.slug) || doc.slug;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "type")) {
      const type = normText(req.body.type);
      if (type) payload.type = type;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "category")) {
      payload.category = normText(req.body.category);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "shortDescription")) {
      payload.shortDescription = normText(req.body.shortDescription);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      payload.description = normText(req.body.description);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "location")) {
      payload.location = normText(req.body.location);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "price")) {
      payload.price = toNum(req.body.price);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "currency")) {
      payload.currency = normText(req.body.currency);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "active")) {
      payload.active = toBool(req.body.active, doc.active ?? true);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "stock")) {
      payload.stock = toNum(req.body.stock);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "delivery")) {
      payload.delivery = normText(req.body.delivery);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "durationMinutes")) {
      payload.durationMinutes = toNum(req.body.durationMinutes);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "capacity")) {
      payload.capacity = toNum(req.body.capacity);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "locations")) {
      const locationsRaw = parseJSON(req.body.locations, req.body.locations);
      payload.locations = sanitizeLocations(locationsRaw);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "tags")) {
      const tagsRaw = parseJSON(req.body.tags, req.body.tags);
      payload.tags = sanitizeTags(tagsRaw);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "links")) {
      const linksRaw = parseJSON(req.body.links, req.body.links);
      payload.links = sanitizeLinks(linksRaw);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "mpMetadata")) {
      payload.mpMetadata = parseJSON(req.body.mpMetadata, undefined);
    }

    const targetType = payload.type || doc.type;
    if (targetType === "activity") {
      payload.price = undefined;
      payload.currency = undefined;
      payload.stock = undefined;
      payload.delivery = undefined;
      payload.durationMinutes = undefined;
      payload.capacity = undefined;
      payload.locations = [];
      payload.mpMetadata = undefined;
    } else {
      payload.location = payload.location ?? "";
    }

    cleanEmptyStrings(payload);

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const updated = await ServiceProductItem.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (Array.isArray(removePublicIds) && removePublicIds.length) {
      await cleanupCloudinary(removePublicIds);
    }

    return res.status(200).json(updated);
  } catch (err) {
    await cleanupCloudinary(uploadedIds);
    console.error("updateServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteServiceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ServiceProductItem.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Producto/Servicio no encontrado" });
    }

    if (!canEdit(doc, req.user)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para eliminar este recurso" });
    }

    await ServiceProductItem.findByIdAndDelete(id);

    const publicIds = (doc.images || [])
      .map((image) => image.public_id)
      .filter(Boolean);
    await cleanupCloudinary(publicIds);

    return res.status(200).json({ message: "Eliminado correctamente" });
  } catch (err) {
    console.error("deleteServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
