import asyncWrapper from "../middlewares/asyncWrapper.js";
import riderService from "../services/riderService.js";

const getAllRiders = asyncWrapper(async (req, res, next) => {
  let { search, page, perPage } = req.query;
  const { riders, count, pages } = await riderService.getAllRiders({
    search,
    page,
    perPage,
  });
  res.status(200).json({ riders, count, pages });
});

const getSingleRider = asyncWrapper(async (req, res, next) => {
  const { riderId } = req.params;
  const rider = await riderService.getRider(riderId);
  res.status(200).json({ rider });
});

export { getAllRiders, getSingleRider };
