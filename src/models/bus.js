import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const BusSchema = new Schema(
  {
    plateNumber: {
      type: String,
      required: true,
    },
    busNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// BusSchema.index({ pickUp: 1, dropOff: 1 });

export default mongoose.model("Bus", BusSchema);
