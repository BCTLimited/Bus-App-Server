import UserProfile from "../models/userProfile.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = [
  "-__v",
  "-password",
  // "-role",
  "-isVerified",
  "-homeLocation",
];

async function getAllRiders(query) {
  const { search, page, perPage } = query;
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let count = 0;
  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };
  let monthlyStats = Array(12).fill(0);
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

  // Monthly Stats
  const monthlyPipeline = [
    {
      $group: {
        _id: { $month: "$createdAt" }, // Group by month
        count: { $sum: 1 }, // Count registrations in each month
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month
    },
  ];

  const monthlyCounts = await UserProfile.aggregate([
    ...pipeline,
    ...monthlyPipeline,
  ]);

  // Iterate over the monthly counts and update countsArray
  monthlyCounts.map((month) => {
    const monthIndex = month._id - 1; // Month index is 0-based
    monthlyStats[monthIndex] = month.count;
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

    return { riders, count, pagination, monthlyStats };
  } catch (error) {
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
    throw error;
  }
}

export default { getAllRiders, getRider };
