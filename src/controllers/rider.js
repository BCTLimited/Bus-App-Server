import asyncWrapper from "../middlewares/asyncWrapper.js";
import riderService from "../services/riderService.js";

const getAllRiders = asyncWrapper(async (req, res, next) => {
  const riders = await riderService.getAllRiders();
  res.status(200).json({ riders });
});

const getSingleRider = asyncWrapper(async (req, res, next) => {
  const { riderId } = req.params;
  const rider = await riderService.getRider(riderId);
  res.status(200).json({ rider });
});

export { getAllRiders, getSingleRider };
