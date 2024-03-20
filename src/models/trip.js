import mongoose from "mongoose";

// Define the Bus schema
const TripSchema = new mongoose.Schema(
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
    fare: {
      type: Number,
      required: true,
    },
    pickUp: {
      type: String,
      required: true,
    },
    dropOff: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    bookedBy: {
      type: mongoose.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    bus: {
      type: mongoose.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trip", TripSchema);
