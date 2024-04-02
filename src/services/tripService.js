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
  // console.log(userId);
  // console.log(tripDetails);
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
  const trip = await Trip.findByIdAndUpdate(tripId);

  if (!trip) {
    throw customError(404, `No Trip with ID: ${tripId}`);
  }
  const code = await generateUniqueCode();

  await Route.findByIdAndUpdate(trip.routeId, {
    $push: { passengers: { passenger: trip.bookedBy, code } },
  });

  const tripCode = await TripCode.create({ code, tripId });

  return tripCode;
}

async function updateTrip(tripId, updatedDetails) {}

async function updateSeatAvailability(routeId, seatNumbers, userId) {
  try {
    // Find the bus route by its ID
    const busRoute = await Route.findById(routeId);

    // Throw an error if the bus route is not found
    if (!busRoute) {
      throw customError(400, "Bus Route not found");
    }

    // Check if any seat is not available
    const anySeatNotAvailable = seatNumbers.some((seatNumber) => {
      // Find the seat by its number
      const seat = busRoute.seats.find(
        (seat) => seat.seatNumber === seatNumber
      );
      // Return true if the seat is not found or not available, false otherwise
      return !seat || !seat.available;
    });

    // If any seat is not available, throw an error
    if (anySeatNotAvailable) {
      throw customError(400, "One or more seats are already occupied");
    }

    // All seats are available, update them
    seatNumbers.forEach((seatNumber) => {
      // Find the seat by its number
      const seat = busRoute.seats.find(
        (seat) => seat.seatNumber === seatNumber
      );
      // Update the seat availability and occupiedBy fields
      seat.available = false;
      seat.occupiedBy = userId;
    });

    // Save the changes to the bus route
    await busRoute.save();

    // Log a success message
    console.log(`Seat ${seatNumbers} on bus ${routeId} updated successfully`);
  } catch (error) {
    // Handle errors
    console.error("Error occurred:", error.message);
    throw error;
  }
}

export default { bookTrip, getAllTrips, generateTripCode };
