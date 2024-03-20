import Trip from "../../src/models/trip.js";
import Bus from "../models/bus.js";
import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

async function bookTrip(userId, tripDetails) {
  // if (!validateMongoId(userId)) {
  //   throw customError(400, `${userId} is not a valid ID`);
  // }
  const requiredFields = [
    "paymentType",
    "fare",
    "pickUp",
    "dropOff",
    "departureTime",
    "seatNumber",
    "busId",
  ];
  // Checks for all fields needed
  const missingField = requiredFields.find((field) => !tripDetails[field]);
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }
  // Verifies busId is a valid mongoDB Id
  if (!validateMongoId(tripDetails.busId)) {
    throw customError(400, `${tripDetails.busId} is not a valid ID`);
  }

  const bus = Bus.findById(tripDetails.busId);
  

  try {
    const userProfile = await UserProfile.findById(userId);
    const trip = await Trip.create({
      bookedBy: userProfile._id,
      ...tripDetails,
    });
    return trip;
  } catch (error) {
    // throw new Error("Error getting available buses: " + error.message);
    throw error;
  }
}

export default { bookTrip };
