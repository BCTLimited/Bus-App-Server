import Bus from "../models/bus.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

async function getAvailableBuses(pickUp, dropOff) {
  try {
    const conditions = {};
    if (pickUp && dropOff) {
      conditions.pickUp = pickUp;
      conditions.dropOff = dropOff;
    }
    const buses = await Bus.find(conditions).select(
      "-__v -createdAt -updatedAt"
    );
    return buses;
  } catch (error) {
    throw new Error("Error getting available buses: " + error.message);
  }
}

async function addNewBus(busDetails) {
  const requiredFields = [
    "pickUp",
    "dropOff",
    "departureTime",
    "seats",
    "price",
  ];
  const missingField = requiredFields.find((field) => !(field in busDetails));
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  try {
    const bus = await Bus.create({ ...busDetails });
    return bus;
  } catch (error) {
    throw new Error("Error adding new bus: " + error.message);
  }
}

async function updateBus(busId, updatedDetails) {
  if (!validateMongoId(busId)) {
    throw customError(400, `${busId} is not a valid ID`);
  }
  try {
    const bus = await Bus.findByIdAndUpdate(busId, updatedDetails, {
      new: true,
    }).select("-__v -createdAt -updatedAt");
    if (!bus) {
      throw customError(404, "Bus not found");
    }
    return bus;
  } catch (error) {
    throw new Error("Error updating bus: " + error.message);
  }
}

async function getBusDetails(busId) {
  if (!validateMongoId(busId)) {
    throw customError(400, `${busId} is not a valid ID`);
  }
  try {
    const bus = await Bus.findById(busId).select("-__v -createdAt -updatedAt");
    if (!bus) {
      throw customError(404, "Bus not found");
    }
    return bus;
  } catch (error) {
    throw new Error("Error getting bus details: " + error.message);
  }
}



export default { getAvailableBuses, addNewBus, updateBus, getBusDetails };
