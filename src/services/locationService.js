import Location from "../models/location.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

async function getLocations() {
  const locations = await Location.find({}).select(excludedFields);
  return locations;
}

async function addLocation(locationDetails) {
  const requiredFields = ["name", "LGA", "state", "pickUp", "dropOff"];
  const missingField = requiredFields.find(
    (field) => !(field in locationDetails)
  );
  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }
  const location = await Location.create(locationDetails);
  return location;
}

async function updateLocation(locationId, updatedDetails) {
  if (!validateMongoId(locationId)) {
    throw customError(400, `${locationId} is not a valid ID`);
  }
  const location = await Location.findByIdAndUpdate(
    locationId,
    updatedDetails,
    { new: true }
  );
  if (!location) {
    throw customError(404, "Location not found");
  }
  return location;
}

async function deleteLocation(locationId) {
  if (!validateMongoId(locationId)) {
    throw customError(400, `${locationId} is not a valid ID`);
  }
  const location = await Location.findByIdAndDelete(locationId);
  if (!location) {
    throw customError(404, "Location not found");
  }
  return location;
}

async function getSingleLocation(locationId) {
  if (!validateMongoId(locationId)) {
    throw customError(400, `${locationId} is not a valid ID`);
  }
  const location = await Location.findById(locationId);
  if (!location) {
    throw customError(404, "Location not found");
  }
  return location;
}

export default {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getSingleLocation,
};
