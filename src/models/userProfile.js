import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
    homeLocation: {
      type: String,
      required: [true, "Please provide a an address"],
      trim: true,
    },
    workLocation: {
      type: String,
      trim: true,
    },
    trips: {
      type: [{ type: mongoose.Types.ObjectId, ref: "Trip" }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserProfile", UserProfileSchema);
