import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const DriverSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    licenseIssueDate: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
    licenseExpiryDate: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    trips: {
      type: [{ type: Schema.Types.ObjectId, ref: "Route" }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Driver", DriverSchema);
