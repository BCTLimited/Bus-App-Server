import Trip from "../../src/models/trip.js";
import Bus from "../models/bus.js";
import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

async function bookTrip(userId, tripDetails) {
  console.log(userId);
  console.log(tripDetails);
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

  try {
    const userProfile = await UserProfile.findOne({ _id: userId });
    await updateSeatAvailability(tripDetails.busId, tripDetails.seatNumber);
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

async function updateSeatAvailability(busId, seatNumber) {
  try {
    // Find the bus by its ID
    const bus = await Bus.findById(busId);

    if (!bus) {
      throw customError(400, "Bus not found");
    }

    // Find the seat by its number
    const seat = bus.seats.find((seat) => seat.seatNumber === seatNumber);

    if (!seat) {
      throw customError(400, "Seat not found");
    }

    // Check if the seat is available
    if (!seat.available) {
      throw customError(400, "Seat is already occupied");
    }

    // Update the seat's availability to false
    seat.available = false;

    // Save the changes
    await bus.save();

    console.log(`Seat ${seatNumber} on bus ${busId} updated successfully`);
  } catch (error) {
    console.error("Error occurred:", error.message);
    throw error;
  }
}

export default { bookTrip };
