import mongoose from "mongoose";
import Trip from "../../src/models/trip.js";
import Route from "../models/route.js";
import TripCode from "../models/tripCode.js";
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

  const trip = await Trip.create({
    bookedBy: userId,
    ...tripDetails,
  });
  return trip;
}

async function getAllTrips(userId) {
  const trips = await Trip.find({ bookedBy: userId }).populate({
    path: "bookedBy",
    select: excludedFields,
  });
  return trips;
}

async function generateTripCode(tripId) {
  if (!validateMongoId(tripId)) {
    throw customError(400, `${tripId} is not a valid ID`);
  }
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw customError(404, `No Trip with ID: ${tripId}`);
  }
  const code = await generateUniqueCode();

  await Route.findByIdAndUpdate(
    trip.routeId,
    {
      $push: {
        passengers: {
          passenger: trip.bookedBy,
          code,
          pickUp: trip.pickUp,
          destination: trip.dropOff,
          seatNumber: trip.seatNumber,
        },
      },
    },
    { new: true }
  );

  const tripCode = await TripCode.create({ code, tripId });

  return tripCode;
}

async function updateTrip(tripId, updatedDetails) {}

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

    console.log(`Seat ${seatNumbers} on bus ${routeId} updated successfully`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error occurred:", error.message);
    throw error;
  }
}

export default { bookTrip, getAllTrips, generateTripCode };
