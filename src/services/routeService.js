import Driver from "../models/driver.js";
import Route from "../models/route.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";
import busService from "./busService.js";
import driverService from "./driverService.js";
import dateUtility from "../utils/dateUtils.js";

const excludedFields = [
  "-__v",
  "-isVerified",
  "-homeLocation",
  "-phoneNumber",
  "-password",
  "-role",
  "-ratings",
];

async function getAvailableRoutes(query) {
  const { pickUp, dropOff, status, page, perPage, search, startDate, endDate } =
    query;

  //
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let conditions = {};
  let counts = {
    pending: 0,
    completed: 0,
    ongoing: 0,
    cancelled: 0,
  };
  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };

  if (pickUp && dropOff) {
    conditions.pickUp = pickUp;
    conditions.dropOff = dropOff;
  }

  if (status) {
    conditions.status = status;
  }

  if (startDate && endDate) {
    conditions.$and = [
      { departureDate: { $gte: startDate } },
      { departureDate: { $lt: endDate } },
    ];
  }

  try {
    const count = await Route.countDocuments(conditions);

    if (search) {
      conditions.$or = [
        { pickUp: { $regex: search, $options: "i" } },
        { dropOff: { $regex: search, $options: "i" } },
      ];
    }

    let query = Route.find(conditions)
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
      .sort({ createdAt: -1 });

    //Apply Pagination
    let routes;
    if (page) {
      const totalRecords = await Route.countDocuments(conditions);
      pagination.totalCount = totalRecords;
      pagination.totalPages = Math.ceil(totalRecords / itemsPerPage);
      query = query.skip(skip).limit(itemsPerPage);
    }

    routes = await query;

    // Get counts for different status
    counts = await Promise.all([
      Route.countDocuments({ status: "pending" }),
      Route.countDocuments({ status: "completed" }),
      Route.countDocuments({ status: "ongoing" }),
      Route.countDocuments({ status: "cancelled" }),
    ]);

    counts = {
      pending: counts[0],
      completed: counts[1],
      ongoing: counts[2],
      cancelled: counts[3],
    };

    return { routes, count, counts, pagination };
  } catch (error) {
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
      // departureDate: dateUtility.getCurrentDate(),
    });

    //Adds the route/trip to the driver's trips
    await driverService.updateDriver(routeDetails.driverId, {
      trips: route._id,
    });
    return route;
  } catch (error) {
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
      throw customError(404, `Route with ID:${routeId} not found`);
    }
    return route;
  } catch (error) {
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
      throw customError(404, `Route with ID:${routeId} not found`);
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
      .populate({
        path: "busId",
        select: excludedFields,
      })
      .lean();
    if (!route) {
      throw customError(404, `Route with ID:${routeId} not found`);
    }
    return route;
  } catch (error) {
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
