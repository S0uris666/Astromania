import ServiceProductItem from "../models/ServiceProduct.model.js";


export const getAllServiceProducts = async (req, res) => {
  try {
    const data = await ServiceProductItem.find({}); 
    return res.status(200).json(data)
  } catch (err) {
    console.error("getAllServiceProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createServiceProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    // slug automático si no viene
    if (!payload.slug && payload.title) {
      payload.slug = slugify(payload.title);
    }

    const created = await ServiceProductItem.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    // manejo de clave duplicada (slug o sku si lo agregas)
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Ya existe un registro con ese valor único",
        keyValue: err.keyValue,
      });
    }
    console.error("createServiceProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }}

