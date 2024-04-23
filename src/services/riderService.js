import UserProfile from "../models/userProfile.js";
import User from "../models/user.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-__v",
  "-password",
  // "-role",
  "-isVerified",
  "-homeLocation",
];

async function getAllRiders({ search, page, perPage }) {
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let count = 0;
  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };
  const pipeline = [];

  //
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

  // Filters out admins and drivers
  pipeline.push({
    $match: {
      "user.role": "user",
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
    const countResult = await UserProfile.aggregate(countPipeline);
    count = countResult.length > 0 ? countResult[0]?.count : 0;

    // Pagination
    if (page) {
      const paginationCountPipeline = [...pipeline];
      paginationCountPipeline.push({
        $count: "count",
      });

      const totalRecords = await UserProfile.aggregate(paginationCountPipeline);
      const totalCount = totalRecords[0]?.count ? totalRecords[0].count : 0;
      pagination.totalCount = totalCount;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: itemsPerPage });
      pagination.totalPages = Math.ceil(totalCount / itemsPerPage);
    }

    let riders = await UserProfile.aggregate(pipeline);

    return { riders, count, pagination };
  } catch (error) {
    console.log("Error getting riders: " + error.message);
    throw error;
  }
}

async function getRider(riderId) {
  if (!validateMongoId(riderId)) {
    throw customError(400, `${riderId} is not a valid ID`);
  }
  try {
    const rider = await UserProfile.findOne({ userId: riderId })
      .populate({
        path: "userId",
        select: excludedFields,
      })
      .populate({
        path: "trips",
        select: excludedFields,
      })
      .select(excludedFields);

    if (!rider) {
      throw customError(404, "Rider not found");
    }
    return rider;
  } catch (error) {
    console.log("Error getting rider: " + error.message);
    throw error;
  }
}

export default { getAllRiders, getRider };
