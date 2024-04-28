import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const BusSchema = new Schema(
  {
    plateNumber: {
      type: String,
      required: [true, "Please provide a plate number"],
      unique: [true, "Plate number already taken"],
    },
    busNumber: {
      type: String,
      required: [true, "Please provide a bus number"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// BusSchema.index({ pickUp: 1, dropOff: 1 });

export default mongoose.model("Bus", BusSchema);
