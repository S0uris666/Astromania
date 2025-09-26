import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    organizer:{
        type:String,
        required:true,
        trim:true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: { type: String, required: true },

    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    requiresRegistration: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: null },
    tags: [{ type: String }],

    isOnline: { type: Boolean, default: false },
    url: { type: String, default: "" },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Validación antes de guardar
eventSchema.pre("save", function (next) {
  if (this.endDateTime < this.startDateTime) {
    return next(
      new Error("La fecha/hora de término no puede ser antes que la de inicio")
    );
  }
  next();
});

export default mongoose.model("Event", eventSchema);
