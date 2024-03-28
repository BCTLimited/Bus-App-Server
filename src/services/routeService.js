import Route from "../models/route.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";
import busService from "./busService.js";
import driverService from "./driverService.js";

const excludedFields = [
  "-__v",
  "-createdAt",
  "-updatedAt",
  "-isVerified",
  "-homeLocation",
  "-phoneNumber",
  "-password",
  "-role",
];

async function getAvailableRoutes(pickUp, dropOff) {
  let conditions = {};
  if (pickUp && dropOff) {
    conditions.pickUp = pickUp;
    conditions.dropOff = dropOff;
  }
  try {
    const routes = await Route.find(conditions)
      .select(excludedFields)
      .populate({
        path: "driverId",
        select: excludedFields,
        populate: {
          path: "userId",
          select: excludedFields,
        },
      })
      .populate({ path: "busId", select: excludedFields })
      .populate({
        path: "seats.occupiedBy",
        select: excludedFields,
        populate: {
          path: "userId",
          select: excludedFields,
        },
      })
      .lean();

    return routes;
  } catch (error) {
    console.log("Error getting available routes: " + error.message);
    throw error;
  }
}

async function addNewRoute(routeDetails) {
  const requiredFields = [
    "pickUp",
    "dropOff",
    "departureTime",
    "departureDate",
    "price",
    "busId",
    "driverId",
  ];

  const missingField = requiredFields.find((field) => !(field in routeDetails));
  try {
    if (missingField) {
      throw customError(400, `${missingField} is required!`);
    }

    // Validate busId and driverId
    if (!validateMongoId(routeDetails.busId)) {
      throw customError(400, `Invalid bus ID: ${routeDetails.busId}`);
    }
    if (!validateMongoId(routeDetails.driverId)) {
      throw customError(400, `Invalid driver ID: ${routeDetails.driverId}`);
    }

    // Checks if busId and driverId are available on the DB
    await busService.getBusDetails(routeDetails.busId);
    await driverService.getDriverDetails(routeDetails.driverId);

    const route = await Route.create(routeDetails);
    return route;
  } catch (error) {
    console.log("Error adding new route: " + error.message);
    throw error;
  }
}

async function updateRoute(routeId, updatedDetails) {
  if (!validateMongoId(routeId)) {
    throw customError(400, `${routeId} is not a valid ID`);
  }
  //updating routes
  try {
    const route = await Route.findByIdAndUpdate(routeId, updatedDetails, {
      new: true,
      runValidators: true,
    }).select(excludedFields);
    if (!route) {
      throw customError(404, "Route not found");
    }
    return route;
  } catch (error) {
    console.log("Error updating route: " + error.message);
    throw error;
  }
}

async function getRouteDetails(routeId) {
  if (!validateMongoId(routeId)) {
    throw customError(400, `${routeId} is not a valid ID`);
  }
  try {
    const route = await Route.findById(routeId)
      .populate({
        path: "driver bus",
        select: excludedFields,
      })
      .populate({
        path: "seats.occupiedBy",
        select: excludedFields,
        populate: {
          path: "userId",
          select: excludedFields,
        },
      });
    if (!route) {
      throw customError(404, "Route not found");
    }
    return route;
  } catch (error) {
    console.log("Error getting route details: " + error.message);
    throw error;
  }
}

export default {
  getAvailableRoutes,
  addNewRoute,
  updateRoute,
  getRouteDetails,
};
