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

async function getAllRiders({ search, page, perPage }) {
  page = page ? parseInt(page) : 1;
  perPage = perPage ? parseInt(perPage) : 5;
  const skip = (page - 1) * perPage;

  // Initiliaze a new condition object
  let conditions = {};

  try {
    let count = await UserProfile.countDocuments(conditions);
    let riders = await UserProfile.find(conditions)
      .populate({
        path: "userId",
        select: excludedFields,
        match: { role: "user" },
      })
      .select(excludedFields)
      .skip(skip)
      .limit(perPage);

    const filteredRiders = riders.filter((rider) => rider.userId);
    riders = filteredRiders;
    count = filteredRiders.length;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const filteredRiders = riders.filter(
        (rider) =>
          (rider.userId && rider.userId.userName.match(searchRegex)) ||
          (rider.userId && rider.userId.lastName.match(searchRegex))
        // Add more search criteria if needed
      );
      riders = filteredRiders;
    }
    return { riders, count };
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
