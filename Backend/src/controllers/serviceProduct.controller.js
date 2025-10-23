import ServiceProductItem from "../models/ServiceProduct.model.js";
import slugify from "slugify";
import {
  cleanEmptyStrings,
  cleanupCloudinary,
  normText,
  parseJSON,
  sanitizeLinks,
  sanitizeLocations,
  sanitizeTags,
  toBool,
  toNum,
  uploadToCloudinary,
  canEdit
} from "../utils/utils.js";

export const getAllServiceProducts = async (_req, res) => {
  try {
    const data = await ServiceProductItem.find({});
    return res.status(200).json(data);
  } catch (err) {
    console.error("getAllServiceProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* const buildPayload = ({ body, images, userId }) => {
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
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  return payload;
}; */

const buildPayload = ({ body, images, userId }) => {
  const title = normText(body.title);
  const type  = normText(body.type);

  const tagsInput      = parseJSON(body.tags, body.tags);
  const locationsInput = parseJSON(body.locations, body.locations);
  const linksInput     = parseJSON(body.links, body.links);
  const mpMeta         = parseJSON(body.mpMetadata, undefined);
  const alts           = parseJSON(body.alts, []);

  const imagesWithAlt = images.map((img, idx) => ({
    url: img.url,
    public_id: img.public_id,
    alt: typeof alts?.[idx] === "string" ? alts[idx].trim() : "",
  }));

  const payload = {
    title,
    slug: normText(body.slug) || slugify(title ?? "", { lower: true, strict: true }),
    type,
    category:         normText(body.category),
    shortDescription: normText(body.shortDescription),
    description:      normText(body.description),
    location:         normText(body.location),

    price:    toNum(body.price),
    currency: normText(body.currency) || "CLP",
    active:   toBool(body.active, true),

    stock:    toNum(body.stock, 0),
    delivery: normText(body.delivery),
    images:   imagesWithAlt,

    durationMinutes: toNum(body.durationMinutes),
    capacity:        toNum(body.capacity),

    locations: sanitizeLocations(locationsInput),
    tags:      sanitizeTags(tagsInput),
    links:     sanitizeLinks(linksInput),

    mpMetadata: mpMeta,
    createdBy:  userId || undefined,
  };

  // Reglas por tipo
  if (payload.type === "activity") {
    delete payload.price;
    delete payload.currency;
    delete payload.stock;
    delete payload.delivery;
    delete payload.durationMinutes;
    delete payload.capacity;
    payload.locations = [];
    delete payload.mpMetadata;
  }

  cleanEmptyStrings(payload);    
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

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

/* export const updateServiceProduct = async (req, res) => {
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
}; */
/* UPDATE */

const FIELDS = {
  // texto plano
  type: (v) => normText(v),
  category: (v) => normText(v),
  shortDescription: (v) => normText(v),
  description: (v) => normText(v),
  location: (v) => normText(v),
  currency: (v) => normText(v),
  delivery: (v) => normText(v),

  // numéricos
  price: (v) => toNum(v),
  stock: (v) => toNum(v),
  durationMinutes: (v) => toNum(v),
  capacity: (v) => toNum(v),

  // booleanos (el default para `active` usa el valor actual del doc; lo inyectamos más abajo)
  active: (v, { doc }) => toBool(v, doc.active ?? true),

  // colecciones
  locations: (v) => sanitizeLocations(parseJSON(v, v)),
  tags: (v) => sanitizeTags(parseJSON(v, v)),
  links: (v) => sanitizeLinks(parseJSON(v, v)),

  // json libre
  mpMetadata: (v) => parseJSON(v, undefined),
};

const clearActivityOnlyFields = (payload) => {
  payload.price = undefined;
  payload.currency = undefined;
  payload.stock = undefined;
  payload.delivery = undefined;
  payload.durationMinutes = undefined;
  payload.capacity = undefined;
  payload.locations = []; 
  payload.mpMetadata = undefined;
};

export const updateServiceProduct = async (req, res) => {
  const uploadedIds = [];

  try {
    const { id } = req.params;
    const doc = await ServiceProductItem.findById(id);
    if (!doc) return res.status(404).json({ message: "Producto/Servicio no encontrado" });

    // Autorización
    if (!canEdit(doc, req.user)) {
      return res.status(403).json({ message: "No tienes permisos para editar este recurso" });
    }

    // ===== 1) Subida de imágenes
    const files = Array.isArray(req.files) ? req.files : [];
    let newImages = [];

    if (files.length) {
      const uploadJobs = files.map((file) => uploadToCloudinary(file, "service-products"));
      const results = await Promise.allSettled(uploadJobs);

      const succeeded = [];
      const failed = [];

      for (const r of results) {
        if (r.status === "fulfilled") {
          const { url, public_id } = r.value;
          uploadedIds.push(public_id);
          succeeded.push({ url, public_id, alt: "" });
        } else {
          failed.push(r.reason?.message || "upload error");
        }
      }

      if (failed.length) {
        // rollback de lo que sí subió
        await cleanupCloudinary(uploadedIds);
        return res.status(400).json({
          message: "Error subiendo una o más imágenes",
          errors: failed,
        });
      }

      newImages = succeeded;
    }

    // ===== 2) Remoción de imágenes antiguas =====
    const removePublicIds = parseJSON(req.body?.removePublicIds, []);
    const previousImages = Array.isArray(doc.images) ? [...doc.images] : [];
    let images = previousImages.filter((img) => !removePublicIds.includes(img.public_id));
    if (newImages.length) images = images.concat(newImages);

    // ===== 3) Payload base =====
    const payload = { images };

    // ----- 3.1 Título  -----
    const hasTitle = Object.prototype.hasOwnProperty.call(req.body, "title");
    const hasSlug = Object.prototype.hasOwnProperty.call(req.body, "slug");

    if (hasTitle) {
      const title = normText(req.body.title);
      if (title) {
        payload.title = title;
        // si viene slug explícito lo usamos; si no, generamos desde title
        payload.slug = normText(req.body.slug) || slugify(title, { lower: true, strict: true });
      }
    } else if (hasSlug) {
      payload.slug = normText(req.body.slug) || doc.slug;
    }

    // ----- 3.2 Resto de campos  -----
    for (const [key, parse] of Object.entries(FIELDS)) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        const raw = req.body[key];
        const value = parse(raw, { doc }); 
        payload[key] = value;
      }
    }

    // ===== 4) Reglas por tipo (activity) =====
  const targetType = payload.type || doc.type;
  if (targetType === "activity") {
    clearActivityOnlyFields(payload);
  }

  cleanEmptyStrings(payload);
  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined) delete payload[k];
  }

    // ===== 6) Persistencia =====
    const updated = await ServiceProductItem.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    // Borrado definitivo en Cloudinary de las imágenes removidas
    if (Array.isArray(removePublicIds) && removePublicIds.length) {
      await cleanupCloudinary(removePublicIds);
    }

    return res.status(200).json(updated);
  } catch (err) {
    // rollback de cualquier subida exitosa
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
