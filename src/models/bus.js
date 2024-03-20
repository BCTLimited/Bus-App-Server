import mongoose from "mongoose";

// Define the Bus schema
const BusSchema = new mongoose.Schema(
  {
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
    plateNmuber: {
      type: String,
    },
    seats: [
      {
        seatNumber: {
          type: Number,
          required: true,
        },
        available: {
          type: Boolean,
          default: true,
        },
        occupiedBy: {
          type: mongoose.Types.ObjectId,
          ref: "UserProfile",
        },
      },
    ],
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Bus", BusSchema);
