import mongoose from "mongoose";

const PerfilImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const SocialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      unique: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    profesion: {type: String},
    especializacion:{},
    
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingresa un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [8, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "superuser"],
      default: "user",
    },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" }, //
    country: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: [PerfilImageSchema],
    links:[SocialLinkSchema],
      description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
     status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
