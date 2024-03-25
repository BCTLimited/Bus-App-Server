import Bus from "../models/bus.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

async function getAvailableBuses() {
  try {
    const buses = await Bus.find().select(excludedFields);
    return buses;
  } catch (error) {
    console.log("Error getting available buses: " + error.message);
    throw error;
  }
}

async function addNewBus(busDetails) {
  const requiredFields = ["plateNumber", "busNumber"];

  const missingField = requiredFields.find((field) => !(field in busDetails));
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  try {
    const bus = await Bus.create({ ...busDetails });
    return bus;
  } catch (error) {
    console.log("Error adding new bus: " + error.message);
    throw error;
  }
}

async function updateBus(busId, updatedDetails) {
  if (!validateMongoId(busId)) {
    throw customError(400, `${busId} is not a valid ID`);
  }
  try {
    const bus = await Bus.findByIdAndUpdate(busId, updatedDetails, {
      new: true,
    }).select(excludedFields);
    if (!bus) {
      throw customError(404, "Bus not found");
    }
    return bus;
  } catch (error) {
    console.log("Error updating bus: " + error.message);
    throw error;
  }
}

async function getBusDetails(busId) {
  if (!validateMongoId(busId)) {
    throw customError(400, `${busId} is not a valid ID`);
  }
  try {
    const bus = await Bus.findById(busId).select(excludedFields);
    if (!bus) {
      throw customError(404, "Bus not found");
    }
    return bus;
  } catch (error) {
    console.log("Error getting bus details: " + error.message);
    throw error;
  }
}

export default { getAvailableBuses, addNewBus, updateBus, getBusDetails };
