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

async function getAllDrivers(query) {
  const { search, page, perPage } = query;
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let count = 0;

  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };

  const pipeline = [];

  // populate userId
  pipeline.push({
    $lookup: {
      from: "users",
      let: { userId: "$userId" },
      localField: "userId",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $project: {
            createdAt: 0,
          },
        },
      ],
    },
  });

  // populate trips
  pipeline.push({
    $lookup: {
      from: "routes",
      localField: "trips",
      foreignField: "_id",
      as: "trips",
      pipeline: [
        {
          $project: {
            createdAt: 0,
          },
        },
      ],
    },
  });

  // Renames user to userId
  pipeline.push({
    $addFields: {
      userId: { $arrayElemAt: ["$user", 0] },
    },
  });

  // Excludes Fields
  pipeline.push({
    $project: {
      updatedAt: 0,
      user: 0,
    },
  });

  // Sort by createdAt
  pipeline.push({
    $sort: { createdAt: -1 }, // Sort in descending order
  });

  // Count pipeline
  const countPipeline = [...pipeline]; // Copy the pipeline
  countPipeline.push({
    $count: "count",
  });

  // Search
  if (search) {
    const searchRegex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "userId.userName": { $regex: searchRegex } },
          { "userId.lastName": { $regex: searchRegex } },
        ],
      },
    });
  }

  try {
    const countResult = await Driver.aggregate(countPipeline);
    count = countResult.length > 0 ? countResult[0]?.count : 0;

    // Pagination
    if (page) {
      const paginationCountPipeline = [...pipeline];
      paginationCountPipeline.push({
        $count: "count",
      });

      const totalRecordsResult = await Driver.aggregate(
        paginationCountPipeline
      );
      const totalRecords = totalRecordsResult[0]?.count
        ? totalRecordsResult[0].count
        : 0;
      console.log(totalRecords);
      pagination.totalCount = totalRecords;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: itemsPerPage });
      const totalPages = Math.ceil(totalRecords / itemsPerPage);
      pagination.totalPages = totalPages;
    }

    let drivers = await Driver.aggregate(pipeline);

    return { drivers, count, pagination };
  } catch (error) {
    console.log("Error getting available drivers: " + error.message);
    throw error;
  }
}

async function addNewDriver(driverDetails, files) {
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

  if (missingField) {
    throw customError(400, `${missingField} is required!`);
  }

  if (!files?.image) {
    throw customError(400, "Image Required");
  }

  try {
    console.log(driverDetails);
    // Register a Driver and verify thier profile
    const { user, userProfile } = await userService.registerUser({
      ...driverDetails,
      homeLocation: "Head Office",
      role: "driver",
    });

    if (files.image) {
      driverDetails.image = await uploadService.uploadUserImage(
        files.image.tempFilePath
      );
    }

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
