import Location from "../models/location.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

async function getLocations(query) {
  const { page, perPage, search } = query;

  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };

  let conditions = {};

  // If there's a search query, add it to the conditions
  if (search) {
    conditions = {
      $or: [
        { name: { $regex: new RegExp(search, "i") } }, // Search by name
        { LGA: { $regex: new RegExp(search, "i") } }, // Search by LGA
      ],
    };
  }

  // Count total number of locations based on conditions
  const totalCount = await Location.countDocuments(conditions);

  // Calculate total number of pages
  pagination.totalPages = Math.ceil(totalCount / itemsPerPage);
  pagination.totalCount = totalCount;

  // Retrieve locations with pagination and conditions
  const locations = await Location.find(conditions)
    .select(excludedFields)
    .skip(skip)
    .limit(itemsPerPage);

  return { locations, pagination };
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
