import mongoose from "mongoose";

const { Schema } = mongoose;

const RatingSchema = new Schema(
  {
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    star: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model("Rating", RatingSchema);
