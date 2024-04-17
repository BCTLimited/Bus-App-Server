import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-__v",
  "-createdAt",
  "-updatedAt",
  "-password",
  "-role",
  "-isVerified",
  "-homeLocation",
];

async function getAllRiders() {
  try {
    let riders = await UserProfile.find()
      .populate({
        path: "userId",
        select: excludedFields,
        match: { role: "user" },
      })
      .select(excludedFields);

    riders = riders.filter((rider) => rider.userId);
    return riders;
  } catch (error) {
    console.log("Error getting riders: " + error.message);
    throw error;
  }
}

async function getRider(riderId) {
  if (!validateMongoId(riderId)) {
    throw customError(400, `${riderId} is not a valid ID`);
  }
  try {
    const rider = await UserProfile.findOne({ userId: riderId })
      .populate({
        path: "userId",
        select: excludedFields,
      })
      .populate({
        path: "trips",
        select: excludedFields,
      })
      .select(excludedFields);

    if (!rider) {
      throw customError(404, "Rider not found");
    }
    return rider;
  } catch (error) {
    console.log("Error getting rider: " + error.message);
    throw error;
  }
}

export default { getAllRiders, getRider };
