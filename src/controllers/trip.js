import asyncWrapper from "../middlewares/asyncWrapper.js";
import TripService from "../services/tripService.js";

const bookTrip = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const trip = await TripService.bookTrip(userId, req.body);
  res.status(200).json({ message: "Trip Booked", trip });
});

const getAllTrips = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const trips = await TripService.getAllTrips(userId);
  res.status(200).json({ trips });
});

const getTripCode = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await TripService.generateTripCode(id, userId);
  res.status(200).json(result);
});

export { bookTrip, getTripCode, getAllTrips };
