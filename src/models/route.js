import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const RouteSchema = new Schema(
  {
    name: {
      type: String,
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
      default: "12:00 PM",
      required: [true, "Please Provide a Departure Time"],
    },
    departureDate: {
      type: Date,
      required: [true, "Please Provide a Departure Date"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "ongoing", "completed", "cancelled"],
        message:
          "Status must be either 'pending', 'ongoing', 'completed' or 'cancelled'",
      },
      default: "pending",
    },
    cancelReason: {
      type: String,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Please provide a Driver"],
    },
    busId: {
      type: Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Please provide a Bus"],
    },
    seats: {
      type: [
        {
          seatNumber: {
            type: Number,
          },
          available: {
            type: Boolean,
            default: true,
          },
          occupiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      default: Array.from({ length: 14 }, (_, index) => ({
        seatNumber: index + 1,
        available: true,
      })),
    },
    passengers: {
      type: [
        {
          passenger: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          code: {
            type: String,
            required: true,
          },
          pickUp: {
            type: String,
            required: true,
          },
          destination: {
            type: String,
            required: true,
          },
          seatNumber: {
            type: [Number],
          },
        },
      ],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RouteSchema.index({ pickUp: 1, dropOff: 1 });

export default mongoose.model("Route", RouteSchema);
