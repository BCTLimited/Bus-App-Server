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

const getSingleTrip = asyncWrapper(async (req, res, next) => {
  const { tripId } = req.params;
  const trip = await TripService.getTrip(tripId);
  res.status(200).json({ trip });
});

const updateTrip = asyncWrapper(async (req, res, next) => {
  const { tripId } = req.params;
  const trip = await TripService.updateTrip(tripId, req.body);
  res.status(200).json({ message: "Trip Updated!", trip });
});

export { bookTrip, getAllTrips, getSingleTrip, updateTrip };
