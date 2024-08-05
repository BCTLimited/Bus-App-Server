import Bus from "../models/bus.js";
import customError from "../utils/customError.js";
import validateMongoId from "../utils/validateMongoId.js";

const excludedFields = ["-__v", "-createdAt", "-updatedAt"];

async function getAvailableBuses(query) {
  const { search, page, perPage } = query;
  const itemsPerPage = perPage ? parseInt(perPage) : 5;
  const skip = page ? (parseInt(page) - 1) * itemsPerPage : 0;

  let pagination = {
    totalPages: 0,
    totalCount: 0,
  };

  let conditions = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");
    conditions.$or = [
      { busNumber: { $regex: searchRegex } },
      { plateNumber: { $regex: searchRegex } },
    ];
  }

  try {
    const count = await Bus.countDocuments();
    let query = Bus.find(conditions)
      .select(excludedFields)
      .sort({ createdAt: -1 });

    if (page) {
      const totalRecords = await Bus.countDocuments(conditions);
      query = query.skip(skip).limit(itemsPerPage);
      pagination.totalCount = totalRecords;
      pagination.totalPages = Math.ceil(totalRecords / itemsPerPage);
    }

    let buses = await query;

    return { buses, count, pagination };
  } catch (error) {
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
    throw error;
  }
}

export default { getAvailableBuses, addNewBus, updateBus, getBusDetails };
