import mongoose from "mongoose";

const { Schema } = mongoose;

const RatingSchema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model("Rating", RatingSchema);
