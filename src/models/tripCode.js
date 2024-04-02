import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const TripCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TripCode", TripCodeSchema);
