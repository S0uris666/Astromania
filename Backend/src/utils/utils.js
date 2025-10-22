import { v2 as cloudinary } from "cloudinary";

export const parseJSON = (value, fallback = undefined) => {
  try {
    if (typeof value !== "string") return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const normText = (value) => {
  if (value === null || value === undefined) return undefined;
  return String(value).trim();
};

export const toBool = (value, def = true) => {
  if (value === undefined || value === null) return def;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

export const toNum = (value, def = undefined) => {
  if (value === undefined || value === null || value === "") return def;
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
};

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const sanitizeTags = (value) =>
  toArray(value)
    .map((tag) => normText(tag)?.toLowerCase())
    .filter(Boolean);

export const sanitizeLocations = (value) =>
  toArray(value)
    .map((location) => normText(location))
    .filter(Boolean);

export const sanitizeLinks = (value) => {
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

export const cleanEmptyStrings = (obj = {}) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string" && obj[key].trim() === "") {
      obj[key] = undefined;
    }
  });
  return obj;
};

export const uploadToCloudinary = async (file, folder = "service-products") => {
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

export const cleanupCloudinary = async (publicIds = []) => {
  if (!publicIds.length) return;
  await Promise.allSettled(
    publicIds
      .filter(Boolean)
      .map((id) => cloudinary.uploader.destroy(id, { resource_type: "image" }))
  );
};


  export const canEdit = (doc, user) => {
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin") return true;
    const ownerId = getOwnerId(doc);
    const uid = getUserId(user);
    return ownerId && uid && String(ownerId) === String(uid);
  };
