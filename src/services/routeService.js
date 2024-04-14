import Driver from "../models/driver.js";
import Route from "../models/route.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";
import busService from "./busService.js";
import driverService from "./driverService.js";
import dateUtility from "../utils/dateUtils.js";

const excludedFields = [
  "-__v",
  "-createdAt",
  "-updatedAt",
  "-isVerified",
  "-homeLocation",
  "-phoneNumber",
  "-password",
  "-role",
  "-ratings",
];

async function getAvailableRoutes(pickUp, dropOff) {
  let conditions = {};
  if (pickUp && dropOff) {
    conditions.pickUp = pickUp;
    conditions.dropOff = dropOff;
  }
  const currentDate = new Date(new Date(dateUtility.getCurrentDate())); // Get the current date
  const nextDay = new Date(new Date(dateUtility.getCurrentDate(24))); // Get the current date plus 24 hours

  try {
    // const routes = await Route.find({
    //   $and: [
    //     { departureDate: { $gte: currentDate } }, // Departure time should be greater than or equal to current date
    //     { departureDate: { $lt: nextDay } }, // Departure time should be less than next day's date
    //   ],
    //   ...conditions,
    // })
    const routes = await Route.find(conditions)
      .select(excludedFields)
      .populate({
        path: "driverId",
        select: excludedFields,
      })
      .populate({ path: "busId", select: excludedFields })
      .populate({
        path: "passengers",
        select: excludedFields,
        populate: {
          path: "passenger",
          select: excludedFields,
        },
      })
      .populate({
        path: "seats.occupiedBy",
        select: excludedFields,
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

    const route = await Route.create({
      ...routeDetails,
      departureDate: dateUtility.getCurrentDate(),
    });
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

async function deleteRoute(routeId) {
  if (!validateMongoId(routeId)) {
    throw customError(400, `${routeId} is not a valid ID`);
  }
  try {
    const route = await Route.findById(routeId);

    if (!route) {
      throw customError(404, "Route not found");
    }

    // Check if any seat has been booked
    const anySeatNotAvailable = route.seats.find(
      (seat) => seat.available === false
    );

    if (anySeatNotAvailable) {
      throw customError(400, "At least one seat on this route has been taken");
    }

    await route.deleteOne();

    return route;
  } catch (error) {
    console.log("Error getting route details: " + error.message);
    throw error;
  }
}

async function getRouteDetails(routeId) {
  if (!validateMongoId(routeId)) {
    throw customError(400, `${routeId} is not a valid ID`);
  }
  try {
    const route = await Route.findById(routeId)
      .select(excludedFields)
      .populate({
        path: "driverId",
        select: excludedFields,
        populate: {
          path: "userId",
          select: excludedFields,
        },
      })
      .populate({
        path: "passengers",
        select: excludedFields,
        populate: {
          path: "passenger",
          select: excludedFields,
        },
      })
      .populate({
        path: "seats",
        select: excludedFields,
      })
      .lean();
    if (!route) {
      throw customError(404, "Route not found");
    }
    return route;
  } catch (error) {
    console.log("Error getting route details: " + error.message);
    throw error;
  }
}

async function getDriverRoutes(userId) {
  const driver = await Driver.findOne({ userId });
  try {
    const routes = await Route.find({ driverId: driver?._id })
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
        path: "seats",
        select: excludedFields,
        populate: {
          path: "userId",
          select: excludedFields,
        },
      })
      .lean();

    return routes;
  } catch (error) {
    throw error;
  }
}

export default {
  getAvailableRoutes,
  addNewRoute,
  updateRoute,
  getRouteDetails,
  deleteRoute,
  getDriverRoutes,
};
