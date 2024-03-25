import Trip from "../../src/models/trip.js";
import Route from "../models/route.js";
import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

async function bookTrip(userId, tripDetails) {
  // console.log(userId);
  // console.log(tripDetails);
  const requiredFields = [
    "paymentType",
    "fare",
    "pickUp",
    "dropOff",
    "departureTime",
    "seatNumber",
    "routeId",
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

  try {
    const userProfile = await UserProfile.findOne({ _id: userId });
    await updateSeatAvailability(
      tripDetails.routeId,
      tripDetails.seatNumber,
      userId
    );
    const trip = await Trip.create({
      bookedBy: userProfile._id,
      ...tripDetails,
    });
    return trip;
  } catch (error) {
    console.log("Error getting available buses: " + error.message);
    throw error;
  }
}

async function updateSeatAvailability(routeId, seatNumbers, userId) {
  try {
    // Find the bus by its ID
    const busRoute = await Route.findById(routeId);

    if (!busRoute) {
      throw customError(400, "Bus Route not found");
    }

    // Loop through each seat number in the array
    for (const seatNumber of seatNumbers) {
      // Find the seat by its number
      const seat = busRoute.seats.find(
        (seat) => seat.seatNumber === seatNumber
      );
      if (!seat) {
        throw customError(404, `Seat ${seatNumber} not found`);
      }

      // Check if the seat is available
      if (!seat.available) {
        throw customError(400, `Seat ${seatNumber} is already occupied`);
      }

      // Update the seat's availability to false
      seat.available = false;
      seat.occupiedBy = userId;
    }

    // Save the changes
    await busRoute.save();

    console.log(`Seat ${seatNumbers} on bus ${routeId} updated successfully`);
  } catch (error) {
    console.error("Error occurred:", error.message);
    throw error;
  }
}

export default { bookTrip };
