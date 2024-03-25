import Driver from "../models/driver.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

async function getAllDrivers() {
  try {
    const drivers = await Driver.find().select(excludedFields);
    return drivers;
  } catch (error) {
    console.log("Error getting available drivers: " + error.message);
    throw error;
  }
}

async function addNewDriver(driverDetails) {
  const requiredFields = [
    "firstName",
    "lastName",
    "licenseIssueDate",
    "licenseExpiryDate",
    "age",
  ];
  const missingField = requiredFields.find(
    (field) => !(field in driverDetails)
  );

  try {
    if (missingField) {
      throw customError(400, `${missingField} is required!`);
    }
    const driver = await Driver.create({ ...driverDetails });
    return driver;
  } catch (error) {
    console.log("Error adding new driver: " + error.message);
    throw error;
  }
}

async function updateDriver(driverId, updatedDetails) {
  if (!validateMongoId(driverId)) {
    throw customError(400, `${driverId} is not a valid ID`);
  }
  try {
    const driver = await Driver.findByIdAndUpdate(driverId, updatedDetails, {
      new: true,
    }).select(excludedFields);
    if (!driver) {
      throw customError(404, "Driver not found");
    }
    return driver;
  } catch (error) {
    console.log("Error updating driver: " + error.message);
    throw error;
  }
}

async function getDriverDetails(driverId) {
  if (!validateMongoId(driverId)) {
    throw customError(400, `${driverId} is not a valid ID`);
  }
  try {
    const driver = await Driver.findById(driverId).select(excludedFields);
    if (!driver) {
      throw customError(404, "Driver not found");
    }
    return driver;
  } catch (error) {
    console.log("Error getting driver details: " + error.message);
    throw error;
  }
}

export default {
  getAllDrivers,
  addNewDriver,
  updateDriver,
  getDriverDetails,
};
