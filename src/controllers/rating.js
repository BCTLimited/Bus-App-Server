import asyncWrapper from "../middlewares/asyncWrapper.js";
import ratingService from "../services/ratingService.js";

const rateRide = asyncWrapper(async (req, res) => {
  const { routeId } = req.params;
  const { userId } = req.user;
  const rating = await ratingService.rateRide(userId, routeId, req.body);
  res.status(200).json({ message: "Rating Stored. Thank You!", rating });
});

const getDriverRatings = asyncWrapper(async (req, res) => {
  const { driverId } = req.params;
  const ratings = await ratingService.getDriverRatings(driverId);
  res.status(200).json({ ratings });
});

export { rateRide, getDriverRatings };
