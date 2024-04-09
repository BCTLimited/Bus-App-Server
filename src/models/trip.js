import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const TripSchema = new Schema(
  {
    paymentType: {
      type: String,
      enum: {
        values: ["card", "transfer", "wallet"],
        message: "Payment type must be either 'card', 'transfer', or 'wallet'",
      },
      require: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success"],
      default: "pending",
    },
    tripType: {
      type: String,
      default: "One Way",
    },
    pickUp: {
      type: String,
      required: true,
    },
    dropOff: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: [Number],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trip", TripSchema);
