import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const BusSchema = new Schema(
  {
    plateNumber: {
      type: String,
      required: [true, "Please provide a plate number"],
      unique: true,
    },
    busNumber: {
      type: String,
      required: [true, "Please provide a bus number"],
    },
    modelName: {
      type: String,
      required: [true, "Please provide a model name"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// BusSchema.index({ pickUp: 1, dropOff: 1 });

export default mongoose.model("Bus", BusSchema);
