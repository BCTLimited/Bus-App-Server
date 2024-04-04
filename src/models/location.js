import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const LocationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    LGA: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pickUp: {
      type: Boolean,
      required: true,
    },
    dropOff: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Location", LocationSchema);
