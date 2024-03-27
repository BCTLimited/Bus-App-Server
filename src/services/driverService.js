import Driver from "../models/driver.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";
import userService from "../services/userService.js";

const excludedFields = [
  "-__v",
  "-password",
  "-role",
  "-createdAt",
  "-updatedAt",
];

async function getAllDrivers() {
  try {
    const drivers = await Driver.find()
      .populate({ path: "userId", select: excludedFields })
      .select(excludedFields);
    return drivers;
  } catch (error) {
    console.log("Error getting available drivers: " + error.message);
    throw error;
  }
}

async function addNewDriver(driverDetails) {
  const requiredFields = [
    "userName",
    "lastName",
    "email",
    "phoneNumber",
    "password",
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

    console.log(driverDetails);
    // Register a Driver and verify thier profile
    const { user, userProfile } = await userService.registerUser({
      ...driverDetails,
      homeLocation: "Head Office",
      role: "driver",
    });

    userProfile.isVerified = true;
    await userProfile.save();

    const driver = await Driver.create({
      userId: user._id,
      ...driverDetails,
    });
    return driver;
  } catch (error) {
    console.log("Error adding new driver: " + error.message);
    throw error;
  }
}

async function updateDriver(driverId, updatedDetails) {
  try {
    if (!validateMongoId(driverId)) {
      throw customError(400, `${driverId} is not a valid ID`);
    }

    const driver = await Driver.findByIdAndUpdate(driverId, updatedDetails, {
      new: true,
    }).select(excludedFields);

    if (!driver) {
      throw customError(404, "Driver not found");
    }

    await userService.updateUserModel(driver.userId, updatedDetails);
    await userService.updateUserProfile(driver.userId, updatedDetails);

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
