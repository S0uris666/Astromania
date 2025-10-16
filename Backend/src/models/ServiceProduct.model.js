import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const LinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const ServiceProductItemSchema = new mongoose.Schema(
  {
    // Identificación básica
    title: { type: String, trim: true, required: true },
    slug: { type: String, lowercase: true, trim: true, unique: true },

    // Clave para distinguir entre producto, servicio o actividad
    type: {
      type: String,
      trim: true,
      required: true,
      enum: ["product", "service", "activity"],
    },

    // Subtipo/categoría (libre)
    category: { type: String, trim: true },

    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },

    // Comercial
    price: { type: Number },
    currency: { type: String, default: "CLP" },
    active: { type: Boolean, default: true },

    // Solo productos (si aplica)
    stock: { type: Number, default: 0 },

    // Entrega / formato (libre: "physical" | "onsite" | "digital" …)
    delivery: { type: String, trim: true },
    images: [ImageSchema],

    // Extras de servicios (si aplica)
    durationMinutes: { type: Number },
    capacity: { type: Number },
    locations: [{ type: String }],

    // Metadatos / vínculos
    tags: [{ type: String, lowercase: true, trim: true }],
    links: [LinkSchema],
    mpMetadata: { type: Object },

    // Auditoría (opcional)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ServiceProductItem = mongoose.model("ServiceProductItem", ServiceProductItemSchema);

export default ServiceProductItem;
