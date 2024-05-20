import Rating from "../models/rating.js";
import Route from "../models/route.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-password",
  "-role",
  "-__v",
  "-createdAt",
  "-updatedAt",
];

async function rateRide(userId, routeId, ratingDetails) {
  const requiredFields = ["star", "comment"];

  const missingField = requiredFields.find(
    (field) => !(field in ratingDetails)
  );

  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  if (!validateMongoId(routeId)) {
    throw customError(400, `${routeId} is not a valid ID`);
  }

  const route = await Route.findById(routeId);

  if (!route) {
    throw customError(404, `Route with ID:${routeId} not found`);
  }

  if (route.status !== "completed" && route.status !== "cancelled") {
    throw customError(400, `Please wait for ride to finish before rating`);
  }

  const rating = await Rating.create({
    reviewerId: userId,
    routeId,
    ...ratingDetails,
  });

  return rating;
}

async function getDriverRatings(driverId) {
  if (!validateMongoId(driverId)) {
    throw customError(400, `${driverId} is not a valid ID`);
  }

  const ratings = await Rating.find()
    .populate({
      path: "routeId",
      select: "_id driverId",
      populate: {
        path: "driverId",
        populate: {
          path: "userId",
          select: excludedFields,
        },
      },
      match: { driverId: driverId },
    })
    .exec();

  //   Filter out the ratings where 'routeId' is not populated (no matching route found)
  const filteredRatings = ratings.filter((rating) => rating.routeId !== null);
  return filteredRatings;
}

export default {
  rateRide,
  getDriverRatings,
};
