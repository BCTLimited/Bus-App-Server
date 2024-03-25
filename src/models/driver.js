import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Bus schema
const DriverSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    licenseIssueDate: {
      type: String,
      required: true,
    },
    licenseExpiryDate: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Driver", DriverSchema);
