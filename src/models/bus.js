import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const BusSchema = new Schema(
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
      default: "12:00 PM",
      required: true,
    },
    plateNumber: {
      type: String,
    },
    driverImage: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
    route: {
      type: [
        {
          locationName: {
            type: String,
            required: true,
          },
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
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
          type: Schema.Types.ObjectId,
          ref: "UserProfile",
        },
      },
    ],
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
BusSchema.index({ pickUp: 1, dropOff: 1 });

export default mongoose.model("Bus", BusSchema);
