import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-__v",
  "-password",
  "-role",
  "-isVerified",
  "-homeLocation",
];

async function getAllRiders({ search, page, perPage }) {
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let pages = 0;
  // Initiliaze a new condition object
  let conditions = {};

  try {
    let count = await UserProfile.countDocuments(conditions);
    let query = UserProfile.find(conditions)
      .populate({
        path: "userId",
        select: excludedFields,
        match: { role: "user" },
      })
      .select(excludedFields)
      .sort({ createdAt: -1 });

    if (page) {
      query = query.skip(skip).limit(itemsPerPage);
    }

    let riders = await query;

    const filteredRiders = riders.filter((rider) => rider.userId);
    riders = filteredRiders;
    count = filteredRiders.length;

    pages = Math.ceil(filteredRiders.length / itemsPerPage);

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const filteredRiders = riders.filter(
        (rider) =>
          (rider.userId && rider.userId.userName.match(searchRegex)) ||
          (rider.userId && rider.userId.lastName.match(searchRegex))
      );

      const totalRecords = filteredRiders.length;
      pages = Math.ceil(totalRecords / itemsPerPage);
      riders = filteredRiders;
    }
    return { riders, count, pages };
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
