import Route from "../models/route.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

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
        path: "driver",
        select: excludedFields,
      });
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
    "price",
    "bus",
    "driver",
  ];

  const missingField = requiredFields.find((field) => !(field in routeDetails));
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  // Validate bus and driver ids
  if (!validateMongoId(routeDetails.bus)) {
    throw customError(400, `Invalid bus ID: ${routeDetails.bus}`);
  }
  if (!validateMongoId(routeDetails.driver)) {
    throw customError(400, `Invalid driver ID: ${routeDetails.driver}`);
  }

  try {
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
  try {
    const route = await Route.findByIdAndUpdate(routeId, updatedDetails, {
      new: true,
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
    const route = await Route.findById(routeId).select(excludedFields);
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
