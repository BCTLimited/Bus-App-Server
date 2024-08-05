import mongoose from "mongoose";
import Trip from "../../src/models/trip.js";
import Route from "../models/route.js";
import customError from "../utils/customError.js";
import generateUniqueCode from "../utils/generateUniqueCode.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-__v",
  "-createdAt",
  "-updatedAt",
  "-password",
  "-role",
];

async function bookTrip(userId, tripDetails) {
  const requiredFields = [
    "paymentType",
    "pickUp",
    "dropOff",
    "seatNumber",
    "routeId",
    "paymentStatus",
  ];
  // Checks for all fields needed
  const missingField = requiredFields.find((field) => !tripDetails[field]);
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }
  // Verifies busId is a valid mongoDB Id
  if (!validateMongoId(tripDetails.routeId)) {
    throw customError(400, `${tripDetails.routeId} is not a valid ID`);
  }

  await updateSeatAvailability(
    tripDetails.routeId,
    tripDetails.seatNumber,
    userId
  );

  const code = await generateUniqueCode();

  const trip = await Trip.create({
    bookedBy: userId,
    code,
    ...tripDetails,
  });

  await Route.findByIdAndUpdate(
    tripDetails.routeId,
    {
      $push: {
        passengers: {
          passenger: userId,
          code,
          pickUp: tripDetails.pickUp,
          destination: tripDetails.dropOff,
          seatNumber: tripDetails.seatNumber,
        },
      },
    },
    { new: true }
  );

  return trip;
}

async function getAllTrips(userId) {
  const trips = await Trip.find({ bookedBy: userId })
    .populate({
      path: "bookedBy",
      select: excludedFields,
    })
    .populate({
      path: "routeId",
      select: [...excludedFields, "-route", "-seats", "-passengers"],
    })
    .select(excludedFields);
  return trips;
}

async function getTrip(tripId) {
  if (!validateMongoId(tripId)) {
    throw customError(400, `${tripId} is not a valid ID`);
  }

  const trip = await Trip.findById(tripId)
    .populate({
      path: "bookedBy",
      select: excludedFields,
    })
    .populate({
      path: "routeId",
      select: [...excludedFields, "-route", "-seats", "-passengers"],
    })
    .select(excludedFields);

  if (!trip) {
    throw customError(404, `Trip not found`);
  }
  return trip;
}

async function updateTrip(tripId, updatedDetails) {
  if (!validateMongoId(tripId)) {
    throw customError(400, `${tripId} is not a valid ID`);
  }

  const { paymentStatus } = updatedDetails;

  const trip = await Trip.findOneAndUpdate(
    { _id: tripId },
    { paymentStatus },
    { new: true }
  );

  if (!trip) {
    throw customError(404, `Trip not found`);
  }
  return trip;
}

async function updateSeatAvailability(routeId, seatNumbers, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const busRoute = await Route.findById(routeId).session(session);
    if (!busRoute) {
      throw customError(400, "Bus Route not found");
    }

    const anySeatNotAvailable = seatNumbers.some((seatNumber) => {
      const seat = busRoute.seats.find(
        (seat) => seat.seatNumber === seatNumber
      );
      return !seat || !seat.available;
    });

    if (anySeatNotAvailable) {
      throw customError(400, "One or more seats are already occupied");
    }

    seatNumbers.forEach((seatNumber) => {
      const seat = busRoute.seats.find(
        (seat) => seat.seatNumber === seatNumber
      );
      seat.available = false;
      seat.occupiedBy = userId;
    });

    await busRoute.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export default { bookTrip, getAllTrips, getTrip, updateTrip };
