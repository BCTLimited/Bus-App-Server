import asyncWrapper from "../middlewares/asyncWrapper.js";
import TripService from "../services/tripService.js";

const bookTrip = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const trip = await TripService.bookTrip(userId, req.body);
  res.status(200).json({ message: "Trip Booked", trip });
});

export { bookTrip };
