import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    fare: {
      type: Number,
      required: true,
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
    departureTime: {
      type: String,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", TransactionSchema);
