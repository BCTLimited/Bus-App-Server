import Driver from "../models/driver.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";
import userService from "../services/userService.js";
import uploadService from "./uploadService.js";

const excludedFields = [
  "-__v",
  "-password",
  "-role",
  "-homeLocation",
  "-isVerified",
];

async function getAllDrivers({ search, page, perPage }) {
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  // Initiliaze a new condition object
  let conditions = {};
  let pages = 0;
  try {
    let count = await Driver.countDocuments(conditions);
    let query = Driver.find(conditions)
      .populate({
        path: "userId",
        select: excludedFields,
      })
      .populate({
        path: "trips",
        select: [...excludedFields, "-route", "-passengers", "-seats"],
      })
      .select(excludedFields)
      .sort({ createdAt: -1 });

    if (page) {
      query = query.skip(skip).limit(itemsPerPage);
    }

    let drivers = await query;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      drivers = drivers.filter(
        (driver) =>
          driver.userId.userName.match(searchRegex) ||
          driver.userId.lastName.match(searchRegex)
      );
    }
    pages = Math.ceil(drivers.length / itemsPerPage);

    return { drivers, count, pages };
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

    const driver = await Driver.findOneAndUpdate(
      { _id: driverId },
      updatedDetails,
      {
        new: true,
      }
    )
      .populate({
        path: "userId",
        select: excludedFields,
      })
      .select(excludedFields);

    if (!driver) {
      throw customError(404, "Driver not found");
    }

    if (updatedDetails.image) {
      // Upload the image
      updatedDetails.image = await uploadService.uploadUserImage(
        updatedDetails.image.tempFilePath
      );
    }

    const userId = driver.userId._id;

    console.log(userId);
    // Update user model and profile
    await userService.updateUserModel(userId, updatedDetails);
    await userService.updateUserProfile(userId, updatedDetails);

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
    const driver = await Driver.findById(driverId)
      .populate({
        path: "userId",
        select: excludedFields,
      })
      .select(excludedFields);
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
